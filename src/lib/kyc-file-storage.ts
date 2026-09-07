import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Local-disk storage for KYC documents (ID photo, selfie, ownership
 * proof). Deliberately stored OUTSIDE `public/` — in `private-uploads/`,
 * a directory Next.js never serves statically under any route — so there
 * is no way to reach these files except through the authorization check
 * in src/app/api/kyc-files/[...path]/route.ts. This is the private-disk
 * equivalent of "S3 private ACL + presigned URLs" from PROJECT_SPEC.md
 * section 3; swap for real S3 once Phase 1's presigned-upload
 * infrastructure exists (same stopgap pattern as src/lib/mail.ts and
 * src/lib/hero-media-storage.ts).
 */

const PRIVATE_ROOT = path.join(process.cwd(), "private-uploads", "kyc");

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export class KycFileValidationError extends Error {}

export type KycFileKind = "id" | "selfie" | "ownership-proof";

function validate(file: File): string {
  const extension = IMAGE_TYPES[file.type];
  if (!extension) {
    throw new KycFileValidationError("Use a JPEG, PNG or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new KycFileValidationError("Each file must be 8MB or smaller.");
  }
  return extension;
}

/** Returns a "key" (relative path) to persist in KycProfile — never a public URL. */
export async function saveKycFile(
  file: File,
  userId: string,
  kind: KycFileKind
): Promise<string> {
  const extension = validate(file);
  const userDir = path.join(PRIVATE_ROOT, userId);
  await mkdir(userDir, { recursive: true });

  const filename = `${kind}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(userDir, filename), buffer);

  return `${userId}/${filename}`;
}

/** Key format is `<userId>/<filename>` — this is what enforces per-user isolation. */
export function kycFileOwnerFromKey(key: string): string | null {
  const [ownerId, filename] = key.split("/");
  if (!ownerId || !filename || filename.includes("..")) return null;
  return ownerId;
}

export async function readKycFile(key: string): Promise<Buffer | null> {
  const ownerId = kycFileOwnerFromKey(key);
  if (!ownerId) return null;

  try {
    return await readFile(path.join(PRIVATE_ROOT, key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteKycFile(key: string): Promise<void> {
  const ownerId = kycFileOwnerFromKey(key);
  if (!ownerId) return;

  try {
    await unlink(path.join(PRIVATE_ROOT, key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
