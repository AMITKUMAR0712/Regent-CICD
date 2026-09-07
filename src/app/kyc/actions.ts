"use server";

import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ownerKycSchema, hostKycSchema, type HostKycInput } from "@/lib/validations/kyc";
import { canSubmitKyc } from "@/lib/rules/kyc";
import { saveKycFile, KycFileValidationError } from "@/lib/kyc-file-storage";
import { sendEmail } from "@/lib/mail";
import { dashboardPathForRole } from "@/lib/dashboard-path";

export type KycActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  previousRejectionReason?: string;
};

function fieldErrorsFromZod(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function submitKycAction(
  _prevState: KycActionState,
  formData: FormData
): Promise<KycActionState> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "HOST")) {
    return { error: "Not authorized." };
  }

  const { id: userId, role } = session.user;

  if (!canSubmitKyc(session.user.kycStatus)) {
    return { error: "KYC has already been submitted." };
  }

  const raw = {
    idType: formData.get("idType"),
    idNumber: formData.get("idNumber"),
    addressLine: formData.get("addressLine"),
    pincode: formData.get("pincode"),
    alternatePhone: (formData.get("alternatePhone") as string) || undefined,
    emergencyContactName: formData.get("emergencyContactName") ?? undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") ?? undefined,
  };

  const schema = role === "HOST" ? hostKycSchema : ownerKycSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const idFile = formData.get("idFile");
  const selfieFile = formData.get("selfieFile");
  const ownershipFile = formData.get("ownershipFile");

  if (!(idFile instanceof File) || idFile.size === 0) {
    return { fieldErrors: { idFile: "Upload a photo of your ID." } };
  }
  if (!(selfieFile instanceof File) || selfieFile.size === 0) {
    return { fieldErrors: { selfieFile: "Upload a selfie." } };
  }
  if (role === "OWNER" && (!(ownershipFile instanceof File) || ownershipFile.size === 0)) {
    return { fieldErrors: { ownershipFile: "Upload proof of property ownership." } };
  }

  let idFileKey: string;
  let selfieFileKey: string;
  let ownershipProofFileKey: string | undefined;
  try {
    idFileKey = await saveKycFile(idFile, userId, "id");
    selfieFileKey = await saveKycFile(selfieFile, userId, "selfie");
    if (role === "OWNER" && ownershipFile instanceof File) {
      ownershipProofFileKey = await saveKycFile(ownershipFile, userId, "ownership-proof");
    }
  } catch (error) {
    if (error instanceof KycFileValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  // The full ID number lives only in `parsed.data.idNumber` and never
  // leaves this function — only the last 4 characters get persisted.
  const idLastFour = parsed.data.idNumber.replace(/\s/g, "").slice(-4);

  const kycData: Prisma.KycProfileUncheckedCreateInput = {
    userId,
    idType: parsed.data.idType,
    idLastFour,
    idFileKey,
    selfieFileKey,
    addressLine: parsed.data.addressLine,
    pincode: parsed.data.pincode,
    alternatePhone: parsed.data.alternatePhone || null,
    ownershipProofFileKey: ownershipProofFileKey ?? null,
    emergencyContactName: role === "HOST" ? (parsed.data as HostKycInput).emergencyContactName : null,
    emergencyContactPhone:
      role === "HOST" ? (parsed.data as HostKycInput).emergencyContactPhone : null,
    status: "PENDING",
    reviewedById: null,
    reviewNote: null,
    reviewedAt: null,
  };

  await prisma.$transaction([
    prisma.kycProfile.upsert({
      where: { userId },
      update: kycData,
      create: kycData,
    }),
    prisma.user.update({ where: { id: userId }, data: { kycStatus: "PENDING" } }),
    prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "SUBMIT",
        entity: "KycProfile",
        entityId: userId,
        after: { status: "PENDING" },
      },
    }),
  ]);

  try {
    await sendEmail(session.user.email ?? "", "KYC submitted", [
      `Hi ${session.user.name ?? ""},`,
      "",
      "We've received your KYC documents and they're now with our team for review.",
      "You'll get an email as soon as a decision is made.",
    ]);
  } catch (error) {
    console.error("Failed to send KYC submitted email:", error);
  }

  redirect(dashboardPathForRole(role));
}
