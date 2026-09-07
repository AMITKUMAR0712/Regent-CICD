import type { Metadata } from "next";
import { headers } from "next/headers";
import { MotionConfig } from "motion/react";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LazyToaster } from "@/components/lazy-toaster";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "PartySpace — find a space, throw the party",
    template: "%s — PartySpace",
  },
  description:
    "Book flats, terraces and farmhouses for private parties across Indian cities. Real house rules up front, verified owners, no surprises.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading headers() here is what it takes to opt every route under this
  // layout out of static prerendering. It has to: src/middleware.ts mints a
  // fresh CSP nonce per request, so any page Next.js prerenders once at
  // build time would ship stale/no nonces that never match a later
  // request's CSP header — every script on that page gets silently blocked
  // in production. See CLAUDE.md "Security baseline" before removing this.
  await headers();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionConfig reducedMotion="user">
          <SmoothScrollProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SmoothScrollProvider>
          <LazyToaster />
        </MotionConfig>
      </body>
    </html>
  );
}
