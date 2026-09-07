import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";

/**
 * Temporary email sender using Gmail SMTP. Phase 3 replaces this with the
 * real `notify()` pipeline (AWS SES + React Email + NotificationLog, per
 * PROJECT_SPEC.md section 5) behind the `NotificationProvider` interface.
 * Gmail SMTP has a ~500/day sending limit and isn't meant for production
 * transactional volume — fine for now, not a long-term answer.
 */

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return cachedTransporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(subject: string, bodyLines: string[]): string {
  const paragraphs = bodyLines
    .map((line) => (line.trim() ? `<p style="margin:0 0 12px">${escapeHtml(line)}</p>` : ""))
    .join("");
  return `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;background:#FAF8FB;color:#1B1424;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px">
      <p style="margin:0 0 16px;font-weight:700;font-size:18px;color:#6B2D5C">PartySpace</p>
      <h1 style="font-size:16px;margin:0 0 12px">${escapeHtml(subject)}</h1>
      ${paragraphs}
    </div>
  </body>
</html>`;
}

export async function sendEmail(to: string, subject: string, bodyLines: string[]): Promise<void> {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    console.log(`[mail] GMAIL_USER/GMAIL_APP_PASSWORD not configured — skipped sending to ${to}`);
    return;
  }

  await getTransporter().sendMail({
    from: `"PartySpace" <${env.GMAIL_USER}>`,
    to,
    subject,
    text: bodyLines.join("\n"),
    html: renderHtml(subject, bodyLines),
  });
}
