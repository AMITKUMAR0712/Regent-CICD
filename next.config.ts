import type { NextConfig } from "next";

// Baseline security headers applied to every response. Route-specific CSP
// with a per-request nonce is layered on top of this in src/middleware.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  experimental: {
    // Default is 1MB — too small for admin hero-video uploads
    // (src/lib/hero-media-storage.ts caps videos at 60MB).
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },

  images: {
    // Listing photos and KYC documents are served from a private S3 bucket
    // via presigned URLs — never a public bucket, never another origin.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
