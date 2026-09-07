"use client";

import { useActionState } from "react";
import { XCircle } from "lucide-react";

import { rejectKycAction, type RejectKycState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const initialState: RejectKycState = {};

export function RejectDialog({ kycProfileId }: { kycProfileId: string }) {
  const rejectWithId = rejectKycAction.bind(null, kycProfileId);
  const [state, formAction, isPending] = useActionState(rejectWithId, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" className="border-destructive/40 text-destructive" />}
      >
        <XCircle className="h-4 w-4" />
        Reject
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this KYC submission</AlertDialogTitle>
            <AlertDialogDescription>
              The applicant sees this reason and can resubmit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            name="reason"
            required
            placeholder="e.g. ID photo is blurry — please reupload a clearer copy."
            className="mt-3"
          />
          {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Rejecting…" : "Reject"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
