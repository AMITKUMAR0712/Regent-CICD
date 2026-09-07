import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "@/components/profile/profile-content";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function HostProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, kycProfile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.kycProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return <ProfileContent user={user} kycProfile={kycProfile} />;
}
