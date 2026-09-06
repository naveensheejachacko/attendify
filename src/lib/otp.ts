import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import type { OtpPurpose } from "@/lib/roles";

const OTP_TTL_MS = 10 * 60 * 1000;

export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function issueOtp(userId: string, purpose: OtpPurpose): Promise<string> {
  await prisma.otpCode.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId,
      purpose,
      codeHash: hashOtp(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return code;
}

export async function consumeOtp(
  userId: string,
  purpose: OtpPurpose,
  code: string,
): Promise<boolean> {
  const row = await prisma.otpCode.findFirst({
    where: {
      userId,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      codeHash: hashOtp(code.trim()),
    },
    orderBy: { createdAt: "desc" },
  });
  if (!row) {
    return false;
  }
  await prisma.otpCode.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
