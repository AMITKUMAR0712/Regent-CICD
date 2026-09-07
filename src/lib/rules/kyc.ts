import "server-only";
import type { KycStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class KycNotApprovedError extends Error {
  constructor(action: string) {
    super(`KYC must be approved before you can ${action}.`);
    this.name = "KycNotApprovedError";
  }
}

/**
 * The single KYC gate — per PROJECT_SPEC.md section 10, item 4. Call this
 * before listing publication (Phase 2) and party-request submission
 * (Phase 5) rather than checking `user.kycStatus` inline at each call
 * site.
 */
export async function assertKycApproved(userId: string, action: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { kycStatus: true },
  });

  if (user.kycStatus !== "APPROVED") {
    throw new KycNotApprovedError(action);
  }
}

/** Whether a user is allowed to (re)submit a KYC application right now. */
export function canSubmitKyc(status: KycStatus): boolean {
  return status === "NOT_SUBMITTED" || status === "REJECTED";
}
