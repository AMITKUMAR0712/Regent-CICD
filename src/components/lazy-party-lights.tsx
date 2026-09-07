"use client";

import dynamic from "next/dynamic";
import type { PartyLightsDensity } from "@/components/party-lights";

// Canvas animation is purely decorative and can't be server-rendered anyway
// — defer its JS until after hydration so it never delays first paint.
const PartyLights = dynamic(() => import("@/components/party-lights").then((m) => m.PartyLights), {
  ssr: false,
});

export function LazyPartyLights({ density }: { density?: PartyLightsDensity }) {
  return <PartyLights density={density} />;
}
