"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";

import { registerSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createVerificationToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { checkRateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { signIn } from "@/lib/auth/auth";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { env } from "@/lib/env";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return headerList.get("x-real-ip") ?? "unknown";
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    city: formData.get("city"),
    agreeToTerms: Boolean(formData.get("agreeToTerms")),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { role, name, email, password, phone, dateOfBirth, city } = parsed.data;

  const ip = await getClientIp();
  const emailLimit = checkRateLimit(rateLimitKey("registration", email), RATE_LIMITS.registration);
  const ipLimit = checkRateLimit(rateLimitKey("registration", `ip:${ip}`), RATE_LIMITS.registration);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    return { error: "Too many attempts. Try again later." };
  }

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phone } }),
  ]);
  if (existingEmail) {
    return { fieldErrors: { email: "An account with this email already exists" } };
  }
  if (existingPhone) {
    return { fieldErrors: { phone: "An account with this phone number already exists" } };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { role, name, email, passwordHash, phone, dateOfBirth, city },
  });

  const token = await createVerificationToken(user.id, "EMAIL_VERIFY");
  const verifyLink = `${env.APP_URL}/verify-email/${token}`;
  try {
    await sendEmail(email, "Verify your email", [
      `Hi ${name},`,
      "",
      "Confirm your email to continue setting up your account:",
      verifyLink,
      "",
      "This link expires in 24 hours.",
    ]);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: dashboardPathForRole(role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please log in." };
    }
    throw error;
  }

  return {};
}
