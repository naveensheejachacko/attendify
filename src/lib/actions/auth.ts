"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";
import { clearSession, createSession, requireUser } from "@/lib/session";
import {
  loginSchema,
  passwordUpdateSchema,
  registerSchema,
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
    return { error: "An account with this email already exists." };
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { id: true },
  });
  const isFirstAdmin = existingAdmin === null;
  const now = new Date();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: isFirstAdmin ? Role.ADMIN : Role.TEACHER,
      emailVerifiedAt: now,
      approvedAt: isFirstAdmin ? now : null,
    },
  });

  if (isFirstAdmin) {
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: Role.ADMIN,
    });
    redirect("/dashboard");
  }

  redirect("/login?status=pending");
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

  if (user.role === Role.TEACHER && !user.approvedAt) {
    return { error: "Wait for admin to approve your faculty access." };
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
