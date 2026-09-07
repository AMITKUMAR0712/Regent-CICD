"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { GlowCard } from "@/components/party/glow-card";

const initialState: LoginState = {};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <GlowCard className="p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-glow/30 bg-glow/10 px-3 py-1 text-xs font-medium text-glow">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Welcome back
        </div>
        <h1 className="font-heading text-2xl font-bold">Log in</h1>
      </div>

      <form action={formAction}>
        <FieldGroup>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

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
              autoComplete="current-password"
              required
            />
            <FieldError errors={fieldError(state, "password")} />
          </Field>

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
            {isPending ? "Logging in…" : "Log in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="text-glow underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </FieldGroup>
      </form>
    </GlowCard>
  );
}

function fieldError(state: LoginState, field: string) {
  const message = state.fieldErrors?.[field];
  return message ? [{ message }] : undefined;
}
