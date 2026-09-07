import { z } from "zod";

function isAtLeast18(dateOfBirth: Date): boolean {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return dateOfBirth <= eighteenYearsAgo;
}

export const registerSchema = z.object({
  role: z.enum(["OWNER", "HOST"], { message: "Choose whether you're listing or booking a space" }),
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[a-zA-Z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number with country code"),
  dateOfBirth: z.coerce
    .date({ message: "Enter a valid date of birth" })
    .refine(isAtLeast18, "You must be at least 18 years old to use PartySpace"),
  city: z.string().trim().min(2, "Enter your city").max(100),
  agreeToTerms: z.literal(true, {
    message: "You must agree to the terms to continue",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
