import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { GlowCard } from "@/components/party/glow-card";
import { FadeIn } from "@/components/party/fade-in";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "KYC queue",
};

const STATUS_ORDER = ["PENDING", "REJECTED", "APPROVED"] as const;

export default async function AdminKycQueuePage() {
  const profiles = await prisma.kycProfile.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  const sorted = [...profiles].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status as never) - STATUS_ORDER.indexOf(b.status as never)
  );

  return (
    <div className="mx-auto max-w-3xl">
      <FadeIn>
        <h1 className="mb-6 font-heading text-2xl font-bold">KYC queue</h1>
      </FadeIn>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No KYC submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((profile, i) => (
            <FadeIn key={profile.id} delay={Math.min(i * 0.05, 0.3)}>
              <Link href={`/admin/kyc/${profile.id}`}>
                <GlowCard className="flex items-center justify-between p-4 transition-transform hover:scale-[1.01]">
                  <div>
                    <p className="font-medium">{profile.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.user.email} · {profile.user.role}
                    </p>
                  </div>
                  <StatusBadge status={profile.status} />
                </GlowCard>
              </Link>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return <Badge className="bg-verified text-white">Approved</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge className="bg-destructive text-white">Rejected</Badge>;
  }
  return <Badge className="bg-glow/20 text-glow">Pending</Badge>;
}
