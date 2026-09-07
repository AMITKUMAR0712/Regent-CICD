import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth-edge";
import { checkRateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";

const ROLE_ROUTES: Array<{ prefix: string; role: "HOST" | "OWNER" | "ADMIN" }> = [
  { prefix: "/host", role: "HOST" },
  { prefix: "/owner", role: "OWNER" },
  { prefix: "/admin", role: "ADMIN" },
];

// CSP host-source wildcards only ever replace a single leftmost label
// (unlike Next's own image remotePatterns, which allow `*` per-segment) —
// so a real bucket host needs to be spelled out exactly, not pattern-matched.
function s3ImgSource(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  return bucket && region ? `https://${bucket}.s3.${region}.amazonaws.com` : "";
}

function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    `default-src 'self'`,
    // Next's dev-mode Fast Refresh runtime needs 'unsafe-eval' — never in production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${s3ImgSource()}`.trim(),
    `font-src 'self' data:`,
    `connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com`,
    `frame-src https://api.razorpay.com https://checkout.razorpay.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];
  return directives.join("; ");
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-IP throttle on the credentials login POST, in addition to the
  // per-email throttle inside authorize() in src/lib/auth/auth.ts.
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request);
    const result = checkRateLimit(rateLimitKey("login", `ip:${ip}`), RATE_LIMITS.login);
    if (!result.allowed) {
      return new NextResponse("Too many attempts. Try again later.", { status: 429 });
    }
  }

  const roleGate = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (roleGate) {
    const session = await auth();

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if ((session.user.role as string) !== roleGate.role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const nonce = crypto.randomUUID().replace(/-/g, "");
  const cspHeader = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
