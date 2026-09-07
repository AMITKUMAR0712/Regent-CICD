import "server-only";
import { z } from "zod";

/**
 * Every environment variable the app reads goes through this schema.
 * Fails fast at boot with a readable error instead of a null-pointer
 * three layers deep in a payment webhook.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.url(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.url(),

  APP_URL: z.url(),

  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().optional().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
  SES_FROM_EMAIL: z.email(),

  AWS_S3_BUCKET: z.string().optional().default(""),

  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),

  MSG91_AUTH_KEY: z.string().optional().default(""),
  MSG91_TEMPLATE_ID: z.string().optional().default(""),

  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),

  // Temporary Gmail SMTP sender — see src/lib/mail.ts.
  GMAIL_USER: z.string().optional().default(""),
  GMAIL_APP_PASSWORD: z.string().optional().default(""),
  CONTACT_RECEIVER_EMAIL: z.email().optional().or(z.literal("")).default(""),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
