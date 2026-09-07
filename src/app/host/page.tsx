import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { EmailVerificationBanner } from "@/components/dashboard/verification-banner";
import { GlowCard } from "@/components/party/glow-card";
import { FadeIn } from "@/components/party/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Host dashboard",
};

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { user } = session;

  return (
    <div className="mx-auto max-w-3xl">
      <FadeIn>
        <h1 className="mb-6 font-heading text-2xl font-bold">Welcome, {user.name}</h1>
      </FadeIn>

      <EmailVerificationBanner emailVerifiedAt={user.emailVerifiedAt} />

      <FadeIn delay={0.1}>
        <GlowCard className="p-6">
          <h2 className="font-heading text-lg font-semibold">Verification status</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            You&apos;ll need approved KYC before you can submit a party request.
          </p>
          <Badge
            variant={user.kycStatus === "APPROVED" ? "default" : "secondary"}
            className={user.kycStatus === "APPROVED" ? "bg-verified text-white" : undefined}
          >
            KYC: {user.kycStatus.replaceAll("_", " ").toLowerCase()}
          </Badge>
          {(user.kycStatus === "NOT_SUBMITTED" || user.kycStatus === "REJECTED") && (
            <Button
              render={<Link href="/kyc" />}
              nativeButton={false}
              className="mt-4 block w-fit bg-primary text-primary-foreground"
            >
              {user.kycStatus === "REJECTED" ? "Resubmit KYC" : "Complete KYC"}
            </Button>
          )}
        </GlowCard>
      </FadeIn>
    </div>
  );
}
