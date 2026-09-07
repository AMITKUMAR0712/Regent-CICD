import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { HeroMediaManager } from "./hero-media-manager";

export const metadata: Metadata = {
  title: "Hero background media",
};

export default async function AdminHeroMediaPage() {
  const items = await prisma.heroMedia.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">Hero background media</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Controls what plays behind the home page hero. One item loops; two or more become a
        swipeable slideshow. No media configured falls back to the default light effect.
      </p>

      <HeroMediaManager items={items} />
    </div>
  );
}
