"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { consumeOtp, issueOtp } from "@/lib/otp";
import { OtpPurpose, Role } from "@/lib/roles";
import { clearSession, createSession, requireUser } from "@/lib/session";
import {
  loginSchema,
  passwordUpdateSchema,
  registerSchema,
  verifySchema,
} from "@/lib/validators";

export type ActionState = {
  error?: string;
  message?: string;
};

function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter a valid name, email, and password (8+ characters)." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    if (existing.emailVerifiedAt || existing.deletedAt) {
      return { error: "An account with this email already exists." };
    }
    const code = await issueOtp(existing.id, OtpPurpose.EMAIL_VERIFY);
    const mail = await sendOtpEmail({
      to: existing.email,
      code,
      purpose: "verify",
    });
    if (!mail.delivered) {
      return { error: mail.error ?? "Could not send the verification email." };
    }
    redirect(`/verify?email=${encodeURIComponent(existing.email)}`);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { id: true },
  });
  const isFirstAdmin = existingAdmin === null;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: isFirstAdmin ? Role.ADMIN : Role.TEACHER,
      ...(isFirstAdmin ? { approvedAt: new Date() } : {}),
    },
  });

  const code = await issueOtp(user.id, OtpPurpose.EMAIL_VERIFY);
  const mail = await sendOtpEmail({
    to: user.email,
    code,
    purpose: "verify",
  });
  if (!mail.delivered) {
    return {
      error: mail.error ?? "Could not send the verification email. Try Resend code on the next page.",
    };
  }

  redirect(`/verify?email=${encodeURIComponent(user.email)}`);
}

export async function verifyEmailAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = verifySchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter the 6-digit code sent to your email." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return { error: "No account found for this email." };
  }

  const ok = await consumeOtp(user.id, OtpPurpose.EMAIL_VERIFY, parsed.data.code);
  if (!ok) {
    return { error: "Invalid or expired code." };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date() },
  });

  if (updated.role === Role.TEACHER && !updated.approvedAt) {
    redirect("/login?status=pending");
  }

  await createSession({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role as Role,
  });
  redirect("/dashboard");
}

export async function resendOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account found for this email." };
  }
  if (user.emailVerifiedAt) {
    return { message: "This email is already verified. You can log in." };
  }
  const code = await issueOtp(user.id, OtpPurpose.EMAIL_VERIFY);
  const mail = await sendOtpEmail({ to: user.email, code, purpose: "verify" });
  if (!mail.delivered) {
    return { error: mail.error ?? "Could not send email. Check Resend settings." };
  }
  return { message: "A new code was sent to your email." };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || user.deletedAt) {
    return { error: "Invalid email or password." };
  }

  const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!match) {
    return { error: "Invalid email or password." };
  }

  if (!user.emailVerifiedAt) {
    const code = await issueOtp(user.id, OtpPurpose.EMAIL_VERIFY);
    const mail = await sendOtpEmail({
      to: user.email,
      code,
      purpose: "verify",
    });
    if (!mail.delivered) {
      return { error: mail.error ?? "Could not send the verification email." };
    }
    redirect(`/verify?email=${encodeURIComponent(user.email)}`);
  }

  if (user.role === Role.TEACHER && !user.approvedAt) {
    return { error: "Email is verified. Wait for admin to approve your faculty access." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordUpdateSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the password fields." };
  }

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row) {
    return { error: "Account not found." };
  }
  const match = await bcrypt.compare(parsed.data.currentPassword, row.passwordHash);
  if (!match) {
    return { error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { message: "Password updated." };
}
