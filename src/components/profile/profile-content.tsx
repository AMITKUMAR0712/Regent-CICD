import Link from "next/link";
import type { KycProfile } from "@prisma/client";
import { CalendarDays, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { GlowCard } from "@/components/party/glow-card";
import { FadeIn } from "@/components/party/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KYC_LABEL: Record<string, string> = {
  NOT_SUBMITTED: "Not submitted",
  PENDING: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function ProfileContent({
  user,
  kycProfile,
}: {
  user: {
    name: string;
    email: string;
    phone: string;
    city: string;
    dateOfBirth: Date;
    kycStatus: string;
    emailVerifiedAt: Date | null;
  };
  kycProfile: KycProfile | null;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn>
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
      </FadeIn>

      <FadeIn delay={0.05}>
        <GlowCard className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold">Account</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row icon={<Mail className="h-4 w-4" />} label="Email">
              {user.email}
              {user.emailVerifiedAt ? (
                <Badge className="ml-2 bg-verified text-white">Verified</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">
                  Unverified
                </Badge>
              )}
            </Row>
            <Row icon={<Phone className="h-4 w-4" />} label="Phone">
              {user.phone}
            </Row>
            <Row icon={<MapPin className="h-4 w-4" />} label="City">
              {user.city}
            </Row>
            <Row icon={<CalendarDays className="h-4 w-4" />} label="Date of birth">
              {user.dateOfBirth.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Row>
          </dl>
        </GlowCard>
      </FadeIn>

      <FadeIn delay={0.1}>
        <GlowCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">KYC verification</h2>
            <Badge
              variant={user.kycStatus === "APPROVED" ? "default" : "secondary"}
              className={user.kycStatus === "APPROVED" ? "bg-verified text-white" : undefined}
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              {KYC_LABEL[user.kycStatus] ?? user.kycStatus}
            </Badge>
          </div>

          {kycProfile && (
            <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
              <Row label="ID type">{kycProfile.idType.replaceAll("_", " ")}</Row>
              <Row label="ID last 4">{kycProfile.idLastFour}</Row>
              <Row label="Address">{kycProfile.addressLine}</Row>
              <Row label="Pincode">{kycProfile.pincode}</Row>
              {kycProfile.emergencyContactName && (
                <Row label="Emergency contact">
                  {kycProfile.emergencyContactName} — {kycProfile.emergencyContactPhone}
                </Row>
              )}
            </dl>
          )}

          {user.kycStatus === "REJECTED" && kycProfile?.reviewNote && (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Rejected: {kycProfile.reviewNote}
            </p>
          )}

          {(user.kycStatus === "NOT_SUBMITTED" || user.kycStatus === "REJECTED") && (
            <Button
              render={<Link href="/kyc" />}
              nativeButton={false}
              className="bg-primary text-primary-foreground"
            >
              {user.kycStatus === "REJECTED" ? "Resubmit KYC" : "Complete KYC"}
            </Button>
          )}
        </GlowCard>
      </FadeIn>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="mb-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
