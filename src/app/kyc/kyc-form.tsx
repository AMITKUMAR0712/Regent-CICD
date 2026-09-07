"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";

import { submitKycAction, type KycActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { GlowCard } from "@/components/party/glow-card";

const initialState: KycActionState = {};

const ID_TYPE_OPTIONS = [
  { value: "DRIVING_LICENCE", label: "Driving licence" },
  { value: "PASSPORT", label: "Passport" },
  { value: "VOTER_ID", label: "Voter ID" },
];

export function KycForm({ role, rejected }: { role: "OWNER" | "HOST"; rejected: boolean }) {
  const [state, formAction, isPending] = useActionState(submitKycAction, initialState);

  return (
    <GlowCard className="p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-glow/30 bg-glow/10 px-3 py-1 text-xs font-medium text-glow">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {rejected ? "Resubmit KYC" : "Verify your identity"}
        </div>
        <h1 className="font-heading text-2xl font-bold">Complete your KYC</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aadhaar isn&apos;t accepted — use a driving licence, passport or voter ID. We only ever
          store the last 4 digits, never the full number.
        </p>
      </div>

      {rejected && state.previousRejectionReason && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Previous submission was rejected: {state.previousRejectionReason}
        </p>
      )}

      <form action={formAction} encType="multipart/form-data">
        <input type="hidden" name="role" value={role} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="idType">ID type</FieldLabel>
            <select
              id="idType"
              name="idType"
              required
              defaultValue=""
              className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Choose an ID type
              </option>
              {ID_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError errors={fieldError(state, "idType")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="idNumber">ID number</FieldLabel>
            <Input id="idNumber" name="idNumber" required />
            <FieldDescription>Only the last 4 characters are saved.</FieldDescription>
            <FieldError errors={fieldError(state, "idNumber")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="idFile">Government ID photo</FieldLabel>
            <FileInput id="idFile" name="idFile" />
            <FieldError errors={fieldError(state, "idFile")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="selfieFile">Selfie / live photo</FieldLabel>
            <FileInput id="selfieFile" name="selfieFile" />
            <FieldError errors={fieldError(state, "selfieFile")} />
          </Field>

          {role === "OWNER" && (
            <Field>
              <FieldLabel htmlFor="ownershipFile">Property ownership proof</FieldLabel>
              <FileInput id="ownershipFile" name="ownershipFile" />
              <FieldDescription>Electricity bill, property tax receipt or rent agreement.</FieldDescription>
              <FieldError errors={fieldError(state, "ownershipFile")} />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="addressLine">Current address</FieldLabel>
            <Input id="addressLine" name="addressLine" required />
            <FieldError errors={fieldError(state, "addressLine")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
            <Input id="pincode" name="pincode" inputMode="numeric" required />
            <FieldError errors={fieldError(state, "pincode")} />
          </Field>

          {role === "HOST" && (
            <>
              <Field>
                <FieldLabel htmlFor="emergencyContactName">Emergency contact name</FieldLabel>
                <Input id="emergencyContactName" name="emergencyContactName" required />
                <FieldError errors={fieldError(state, "emergencyContactName")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="emergencyContactPhone">Emergency contact phone</FieldLabel>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  placeholder="+919876543210"
                  required
                />
                <FieldError errors={fieldError(state, "emergencyContactPhone")} />
              </Field>
            </>
          )}

          <Field>
            <FieldLabel htmlFor="alternatePhone">Alternate phone (optional)</FieldLabel>
            <Input id="alternatePhone" name="alternatePhone" type="tel" placeholder="+919876543210" />
            <FieldError errors={fieldError(state, "alternatePhone")} />
          </Field>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground shadow-[0_0_30px_-8px_rgba(169,79,146,0.7)]"
          >
            {isPending ? "Submitting…" : "Submit for review"}
          </Button>
        </FieldGroup>
      </form>
    </GlowCard>
  );
}

function FileInput({ id, name }: { id: string; name: string }) {
  return (
    <input
      id={id}
      name={name}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      required
      className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-glow/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-glow hover:file:bg-glow/20"
    />
  );
}

function fieldError(state: KycActionState, field: string) {
  const message = state.fieldErrors?.[field];
  return message ? [{ message }] : undefined;
}
