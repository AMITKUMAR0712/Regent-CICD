import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/party/glow-card";

export const metadata = {
  title: "Verify your email",
};

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await consumeVerificationToken(token, "EMAIL_VERIFY");

  if (result.ok) {
    await prisma.user.update({
      where: { id: result.userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  return (
    <GlowCard className="p-8 text-center">
      <div
        className={
          result.ok
            ? "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verified/10 shadow-[0_0_30px_-8px_rgba(29,158,117,0.7)]"
            : "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
        }
      >
        {result.ok ? (
          <CheckCircle2 className="h-7 w-7 text-verified" aria-hidden="true" />
        ) : (
          <XCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
        )}
      </div>
      <h1 className="font-heading text-xl font-bold">
        {result.ok ? "Email verified" : "This link no longer works"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result.ok
          ? "Your email is confirmed. You can continue to your dashboard."
          : verifyFailureMessage(result.ok ? undefined : result.reason)}
      </p>
      <Button
        render={<Link href={result.ok ? "/" : "/login"} />}
        nativeButton={false}
        className="mt-6 w-full bg-primary text-primary-foreground"
      >
        {result.ok ? "Go to dashboard" : "Back to login"}
      </Button>
    </GlowCard>
  );
}

function verifyFailureMessage(reason: "not_found" | "expired" | "used" | undefined): string {
  switch (reason) {
    case "expired":
      return "This verification link has expired. Log in and request a new one.";
    case "used":
      return "This verification link has already been used.";
    default:
      return "This verification link is invalid.";
  }
}
