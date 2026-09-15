import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { Button } from "@/components/ui/button";
import { PartyBackdrop } from "@/components/party/party-backdrop";
import { FadeIn } from "@/components/party/fade-in";

export const metadata: Metadata = {
  title: "PartySpace — find a space, throw the party",
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect(dashboardPathForRole(session.user.role));
  }

  const heroMedia = await prisma.heroMedia.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <PartyBackdrop density="vivid" media={heroMedia} />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-heading text-xl font-bold">PartySpace</span>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="ghost"
          className="text-foreground hover:bg-white/10"
        >
          Log in
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <FadeIn>
          <p className="eyebrow mb-4 text-glow">Flats · Terraces · Farmhouses</p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="max-w-2xl font-heading text-4xl font-bold sm:text-5xl">
            Find a space, throw the party.
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Realll house rules up front, verified owners, no surprises. PartySpace connects private
            spaces with the people planning the next get-together.
          </p>
        </FadeIn>

        <FadeIn delay={0.26} className="mt-10 grid w-full max-w-md gap-3 sm:grid-cols-2">
          <Button
            render={<Link href="/register" />}
            nativeButton={false}
            size="lg"
            className="bg-primary text-primary-foreground shadow-[0_0_30px_-6px_rgba(169,79,146,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            I have a space
          </Button>
          <Button
            render={<Link href="/register" />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="border-white/20 text-foreground transition-transform hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]"
          >
            I want to book a space
          </Button>
        </FadeIn>
      </main>

      <footer className="relative z-10 px-6 py-8 text-center text-sm text-muted-foreground">
        <Link href="/terms" className="underline underline-offset-4">
          Terms of service
        </Link>
      </footer>
    </div>
  );
}
