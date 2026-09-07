import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/host", "/owner", "/admin", "/api", "/checkin", "/verify-email"],
      },
    ],
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
