"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}

export async function approveKycAction(kycProfileId: string): Promise<void> {
  const admin = await requireAdmin();
  await decide(kycProfileId, admin.id, "APPROVED", null);
  redirect("/admin/kyc");
}

export type RejectKycState = { error?: string };

export async function rejectKycAction(
  kycProfileId: string,
  _prevState: RejectKycState,
  formData: FormData
): Promise<RejectKycState> {
  const admin = await requireAdmin();
  const reason = (formData.get("reason") as string)?.trim();
  if (!reason) {
    return { error: "Give a reason so the applicant knows what to fix." };
  }

  await decide(kycProfileId, admin.id, "REJECTED", reason);
  redirect("/admin/kyc");
}

async function decide(
  kycProfileId: string,
  adminId: string,
  status: "APPROVED" | "REJECTED",
  reason: string | null
) {
  const before = await prisma.kycProfile.findUniqueOrThrow({
    where: { id: kycProfileId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const after = await prisma.$transaction(async (tx) => {
    const updated = await tx.kycProfile.update({
      where: { id: kycProfileId },
      data: { status, reviewNote: reason, reviewedById: adminId, reviewedAt: new Date() },
    });
    await tx.user.update({ where: { id: before.userId }, data: { kycStatus: status } });
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: status,
        entity: "KycProfile",
        entityId: kycProfileId,
        before: { status: before.status } as unknown as Prisma.InputJsonValue,
        after: { status } as unknown as Prisma.InputJsonValue,
      },
    });
    return updated;
  });

  revalidatePath("/admin/kyc");

  try {
    await sendEmail(
      before.user.email,
      status === "APPROVED" ? "KYC approved" : "KYC rejected",
      status === "APPROVED"
        ? [
            `Hi ${before.user.name},`,
            "",
            "Your KYC is approved. You're verified on PartySpace.",
          ]
        : [
            `Hi ${before.user.name},`,
            "",
            "Your KYC submission was rejected.",
            `Reason: ${reason}`,
            "",
            "You can fix this and resubmit from your dashboard.",
          ]
    );
  } catch (error) {
    console.error("Failed to send KYC decision email:", error);
  }

  return after;
}
