import { MailWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EmailVerificationBanner({ emailVerifiedAt }: { emailVerifiedAt: Date | null }) {
  if (emailVerifiedAt) return null;

  return (
    <Alert className="mb-6 border-destructive/30 bg-destructive/10 backdrop-blur-xl">
      <MailWarning className="h-4 w-4 text-destructive" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription>
        Check your inbox for a verification link. You&apos;ll need a verified email before you can
        submit KYC.
      </AlertDescription>
    </Alert>
  );
}
