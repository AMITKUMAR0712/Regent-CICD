import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { GlowCard } from "@/components/party/glow-card";
import { FadeIn } from "@/components/party/fade-in";

export const metadata: Metadata = {
  title: "Admin metrics",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [ownerCount, hostCount, pendingKyc] = await Promise.all([
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.kycProfile.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <FadeIn>
        <h1 className="mb-6 font-heading text-2xl font-bold">Welcome, {session.user.name}</h1>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Owners" value={ownerCount} delay={0} />
        <MetricCard label="Hosts" value={hostCount} delay={0.08} />
        <MetricCard label="KYC pending review" value={pendingKyc} delay={0.16} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <GlowCard className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 font-mono text-3xl font-medium text-glow">{value}</p>
      </GlowCard>
    </FadeIn>
  );
}
