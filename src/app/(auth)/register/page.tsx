"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Home, PartyPopper, Sparkles } from "lucide-react";

import { registerAction, type RegisterState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { GlowCard } from "@/components/party/glow-card";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <GlowCard className="p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-glow/30 bg-glow/10 px-3 py-1 text-xs font-medium text-glow">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Join the party
        </div>
        <h1 className="font-heading text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          List a space to host parties, or find one to book.
        </p>
      </div>

      <form action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="role-owner">I want to</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <RoleOption
                id="role-owner"
                value="OWNER"
                icon={<Home className="h-5 w-5" aria-hidden="true" />}
                label="List my space"
              />
              <RoleOption
                id="role-host"
                value="HOST"
                icon={<PartyPopper className="h-5 w-5" aria-hidden="true" />}
                label="Book a space"
              />
            </div>
            <FieldError errors={fieldError(state, "role")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" name="name" autoComplete="name" required />
            <FieldError errors={fieldError(state, "name")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            <FieldError errors={fieldError(state, "email")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            <FieldDescription>At least 8 characters, with a letter and a number.</FieldDescription>
            <FieldError errors={fieldError(state, "password")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+919876543210"
              required
            />
            <FieldError errors={fieldError(state, "phone")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
            <FieldDescription>You must be 18 or older to use PartySpace.</FieldDescription>
            <FieldError errors={fieldError(state, "dateOfBirth")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" name="city" autoComplete="address-level2" required />
            <FieldError errors={fieldError(state, "city")} />
          </Field>

          <Field orientation="horizontal">
            <Checkbox id="agreeToTerms" name="agreeToTerms" required />
            <FieldLabel htmlFor="agreeToTerms" className="font-normal">
              I agree to the{" "}
              <Link href="/terms" className="text-glow underline underline-offset-4" target="_blank">
                terms of service
              </Link>
            </FieldLabel>
          </Field>
          <FieldError errors={fieldError(state, "agreeToTerms")} />

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground shadow-[0_0_30px_-8px_rgba(169,79,146,0.7)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-glow underline underline-offset-4">
              Log in
            </Link>
          </p>
        </FieldGroup>
      </form>
    </GlowCard>
  );
}

function fieldError(state: RegisterState, field: string) {
  const message = state.fieldErrors?.[field];
  return message ? [{ message }] : undefined;
}

function RoleOption({
  id,
  value,
  icon,
  label,
}: {
  id: string;
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="has-checked:border-glow has-checked:bg-glow/10 has-checked:text-glow has-checked:shadow-[0_0_20px_-6px_rgba(242,180,65,0.6)] flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-input p-4 text-center text-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/5"
    >
      <input
        id={id}
        type="radio"
        name="role"
        value={value}
        defaultChecked={value === "OWNER"}
        className="sr-only"
        required
      />
      {icon}
      <span>{label}</span>
    </label>
  );
}
