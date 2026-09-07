import "server-only";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import type { VerificationTokenType } from "@prisma/client";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createVerificationToken(userId: string, type: VerificationTokenType) {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.create({
    data: { userId, token, type, expiresAt },
  });

  return token;
}

export type ConsumeTokenResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

export async function consumeVerificationToken(
  token: string,
  type: VerificationTokenType
): Promise<ConsumeTokenResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.type !== type) {
    return { ok: false, reason: "not_found" };
  }
  if (record.usedAt) {
    return { ok: false, reason: "used" };
  }
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, userId: record.userId };
}
