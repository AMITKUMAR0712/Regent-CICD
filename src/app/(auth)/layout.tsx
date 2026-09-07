import Link from "next/link";

import { PartyBackdrop } from "@/components/party/party-backdrop";
import { FadeIn } from "@/components/party/fade-in";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="night relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
      <PartyBackdrop density="vivid" />

      <FadeIn className="relative z-10 flex w-full flex-col items-center">
        <Link href="/" className="mb-8 font-heading text-xl font-bold text-primary">
          PartySpace
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </FadeIn>
    </div>
  );
}
