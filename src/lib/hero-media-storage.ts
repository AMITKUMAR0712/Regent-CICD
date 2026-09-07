import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { HeroMediaType } from "@prisma/client";

/**
 * Local-disk storage for admin-uploaded hero background media. Files land
 * in public/uploads/hero and are served through the route handler at
 * src/app/api/hero-media/[filename]/route.ts — NOT Next's static /public
 * serving, which doesn't pick up files added after the server starts (see
 * that route handler's comment for how this was confirmed). The DB only
 * stores the resulting URL. This is a stopgap the same way src/lib/mail.ts
 * is — swap the two functions below for S3 puts/deletes once Phase 1's
 * presigned-upload infrastructure exists; nothing else in the app needs
 * to change.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "hero");
const PUBLIC_PREFIX = "/api/hero-media";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60MB

export class HeroMediaValidationError extends Error {}

export function classifyHeroMediaFile(file: File): { type: HeroMediaType; extension: string } {
  if (file.type in IMAGE_TYPES) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new HeroMediaValidationError("Images must be 10MB or smaller.");
    }
    return { type: "IMAGE", extension: IMAGE_TYPES[file.type]! };
  }

  if (file.type in VIDEO_TYPES) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new HeroMediaValidationError("Videos must be 60MB or smaller.");
    }
    return { type: "VIDEO", extension: VIDEO_TYPES[file.type]! };
  }

  throw new HeroMediaValidationError(
    "Unsupported file type. Use JPEG, PNG or WebP images, or MP4/WebM video."
  );
}

export async function saveHeroMediaFile(file: File): Promise<{ url: string; type: HeroMediaType }> {
  const { type, extension } = classifyHeroMediaFile(file);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { url: `${PUBLIC_PREFIX}/${filename}`, type };
}

export async function deleteHeroMediaFile(url: string): Promise<void> {
  if (!url.startsWith(`${PUBLIC_PREFIX}/`)) return; // never delete outside the upload dir
  const filename = url.slice(`${PUBLIC_PREFIX}/`.length);
  if (!filename || filename.includes("/") || filename.includes("..")) return;

  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
