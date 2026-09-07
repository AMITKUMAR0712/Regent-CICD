"use client";

import dynamic from "next/dynamic";

// Toast UI is never needed for first paint — defer its JS until after hydration.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  return <Toaster />;
}
