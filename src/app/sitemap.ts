import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Only lists pages that exist today. Expanded in Phase 4 with
// /spaces/[slug], /cities/[city], /how-it-works, /for-owners, etc. as those
// pages are built — a sitemap entry for a page that 404s hurts SEO more
// than an incomplete sitemap does.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${env.APP_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
