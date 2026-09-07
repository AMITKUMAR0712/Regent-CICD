import { NextResponse, type NextRequest } from "next/server";
import { open, readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Serves admin-uploaded hero media from local disk.
 *
 * This exists because Next.js's production static file server
 * (`next start`) does not pick up files added to `public/` after the
 * server process has started — confirmed empirically: a file written to
 * `public/uploads/hero/` while the server is running 404s even on a
 * direct request, and only becomes servable after a restart. A route
 * handler always re-reads the filesystem per request, so it doesn't hit
 * that stale-manifest behavior. Because of this, hero media URLs are
 * `/api/hero-media/<filename>`, not a literal `/uploads/hero/...` path —
 * and since it's not a literal public/ path, next/image's local
 * optimizer can't process it either (it expects to resolve `src` to a
 * real file under public/ directly). Hero media renders via plain
 * <img>/<video> tags for this reason — see
 * src/components/party/hero-background-media.tsx.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "hero");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const cacheControl = "public, max-age=31536000, immutable";
  const range = request.headers.get("range");

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : size - 1;
      const chunkSize = end - start + 1;

      const fileHandle = await open(filePath, "r");
      try {
        const buffer = Buffer.alloc(chunkSize);
        await fileHandle.read(buffer, 0, chunkSize, start);
        return new NextResponse(buffer, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Cache-Control": cacheControl,
          },
        });
      } finally {
        await fileHandle.close();
      }
    }
  }

  const buffer = await readFile(filePath);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl,
    },
  });
}
