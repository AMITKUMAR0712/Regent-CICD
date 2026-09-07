import type { HeroMedia } from "@prisma/client";

import { LazyPartyLights } from "@/components/lazy-party-lights";
import type { PartyLightsDensity } from "@/components/party-lights";
import { HeroBackgroundMedia } from "@/components/party/hero-background-media";
import { cn } from "@/lib/utils";

/**
 * Standard night-surface backdrop. Drop into any page/layout's root
 * element — it just needs `relative` on that element (handled here) and
 * `night` alongside it for the palette.
 *
 * Pass `media` (from `prisma.heroMedia.findMany`) to show admin-uploaded
 * background video/images instead of the default ambient lights — used on
 * the home hero only. Everywhere else just gets the lights.
 */
export function PartyBackdrop({
  density = "vivid",
  media,
  className,
}: {
  density?: PartyLightsDensity;
  media?: HeroMedia[];
  className?: string;
}) {
  const hasMedia = (media?.length ?? 0) > 0;

  return (
    <div
      className={cn("absolute inset-0 z-0", hasMedia ? "" : "pointer-events-none", className)}
      {...(hasMedia ? {} : { "aria-hidden": "true" as const })}
    >
      {hasMedia ? <HeroBackgroundMedia items={media!} /> : <LazyPartyLights density={density} />}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/40 via-transparent to-background" />
    </div>
  );
}
