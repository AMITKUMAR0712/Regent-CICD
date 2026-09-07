import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { GlowCard } from "@/components/party/glow-card";
import { FadeIn } from "@/components/party/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveKycAction } from "./actions";
import { RejectDialog } from "./reject-dialog";

export const metadata: Metadata = {
  title: "Review KYC",
};

export default async function AdminKycDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await prisma.kycProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!profile) notFound();

  const isPending = profile.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{profile.user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {profile.user.email} · {profile.user.role}
            </p>
          </div>
          <Badge
            className={
              profile.status === "APPROVED"
                ? "bg-verified text-white"
                : profile.status === "REJECTED"
                  ? "bg-destructive text-white"
                  : "bg-glow/20 text-glow"
            }
          >
            {profile.status}
          </Badge>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <GlowCard className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold">Submitted details</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="ID type">{profile.idType.replaceAll("_", " ")}</Detail>
            <Detail label="ID last 4">{profile.idLastFour}</Detail>
            <Detail label="Address">{profile.addressLine}</Detail>
            <Detail label="Pincode">{profile.pincode}</Detail>
            {profile.alternatePhone && (
              <Detail label="Alternate phone">{profile.alternatePhone}</Detail>
            )}
            {profile.emergencyContactName && (
              <Detail label="Emergency contact">
                {profile.emergencyContactName} — {profile.emergencyContactPhone}
              </Detail>
            )}
          </dl>
        </GlowCard>
      </FadeIn>

      <FadeIn delay={0.1}>
        <GlowCard className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold">Documents</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DocumentThumb label="Government ID" fileKey={profile.idFileKey} />
            <DocumentThumb label="Selfie" fileKey={profile.selfieFileKey} />
            {profile.ownershipProofFileKey && (
              <DocumentThumb label="Ownership proof" fileKey={profile.ownershipProofFileKey} />
            )}
          </div>
        </GlowCard>
      </FadeIn>

      {isPending && (
        <FadeIn delay={0.15} className="flex gap-3">
          <form action={approveKycAction.bind(null, profile.id)}>
            <Button type="submit" className="bg-verified text-white hover:bg-verified/90">
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          </form>
          <RejectDialog kycProfileId={profile.id} />
        </FadeIn>
      )}

      {profile.status === "REJECTED" && profile.reviewNote && (
        <FadeIn delay={0.15}>
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Rejected: {profile.reviewNote}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-0.5 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

function DocumentThumb({ label, fileKey }: { label: string; fileKey: string }) {
  return (
    <a
      href={`/api/kyc-files/${fileKey}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element -- served via authorized route handler, not a public/ path */}
        <img
          src={`/api/kyc-files/${fileKey}`}
          alt={label}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">{label}</p>
    </a>
  );
}
