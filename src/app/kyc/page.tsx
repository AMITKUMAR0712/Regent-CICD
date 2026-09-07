import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { canSubmitKyc } from "@/lib/rules/kyc";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { PartyBackdrop } from "@/components/party/party-backdrop";
import { FadeIn } from "@/components/party/fade-in";
import { GlowCard } from "@/components/party/glow-card";
import { Button } from "@/components/ui/button";
import { KycForm } from "./kyc-form";

export const metadata: Metadata = {
  title: "Complete KYC",
};

export default async function KycPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OWNER" && session.user.role !== "HOST") {
    redirect(dashboardPathForRole(session.user.role));
  }

  const { role, kycStatus } = session.user;
  const dashboardHref = dashboardPathForRole(role);

  return (
    <div className="night relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 py-12 text-foreground">
      <PartyBackdrop density="calm" />

      <FadeIn className="relative z-10 flex w-full flex-col items-center">
        <Link href="/" className="mb-8 font-heading text-xl font-bold text-primary">
          PartySpace
        </Link>

        <div className="w-full max-w-lg">
          {canSubmitKyc(kycStatus) ? (
            <KycForm role={role} rejected={kycStatus === "REJECTED"} />
          ) : (
            <GlowCard className="p-8 text-center">
              {kycStatus === "APPROVED" ? (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verified/10 shadow-[0_0_30px_-8px_rgba(29,158,117,0.7)]">
                    <CheckCircle2 className="h-7 w-7 text-verified" aria-hidden="true" />
                  </div>
                  <h1 className="font-heading text-xl font-bold">KYC approved</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You&apos;re verified. Head back to your dashboard to continue.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-glow/10">
                    <Clock className="h-7 w-7 text-glow" aria-hidden="true" />
                  </div>
                  <h1 className="font-heading text-xl font-bold">KYC under review</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ve got your documents. You&apos;ll get an email as soon as an admin
                    reviews them.
                  </p>
                </>
              )}
              <Button
                render={<Link href={dashboardHref} />}
                nativeButton={false}
                className="mt-6 w-full bg-primary text-primary-foreground"
              >
                Back to dashboard
              </Button>
            </GlowCard>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
