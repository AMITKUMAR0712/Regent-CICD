import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PartyBackdrop } from "@/components/party/party-backdrop";
import { GlowCard } from "@/components/party/glow-card";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "PartySpace terms of service.",
};

export default function TermsPage() {
  return (
    <div className="night relative min-h-screen overflow-hidden bg-background text-foreground">
      <PartyBackdrop density="calm" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to PartySpace
        </Link>

        <GlowCard className="p-8">
          <h1 className="mb-4 font-heading text-2xl font-bold">Terms of service</h1>
          <p className="mb-4 text-sm text-glow">
            Placeholder — final legal copy to be supplied by the operator.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            PartySpace is a discovery and connection service. We help owners list private spaces
            and help hosts find them. The rental agreement, payment, deposit and the event itself
            are the responsibility of the owner and the host — PartySpace is not a party to that
            transaction and does not handle party funds, cleaning, catering, damage settlement or
            insurance.
          </p>
        </GlowCard>
      </div>
    </div>
  );
}
