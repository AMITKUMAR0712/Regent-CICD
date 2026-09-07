import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { readKycFile, kycFileOwnerFromKey } from "@/lib/kyc-file-storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Serves KYC documents from private disk storage — the presigned-URL
 * equivalent for a non-S3 stopgap. Every request re-checks the session:
 * only the document's own owner or an admin can ever read it. No route
 * anywhere else in the app can reach these bytes.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const key = segments.join("/");

  const ownerId = kycFileOwnerFromKey(key);
  if (!ownerId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await auth();
  const isOwner = session?.user?.id === ownerId;
  const isAdmin = session?.user?.role === "ADMIN";
  if (!session?.user || (!isOwner && !isAdmin)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readKycFile(key);
  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
