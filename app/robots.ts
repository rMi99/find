import type { MetadataRoute } from "next";
import { indexingEnabled, siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingEnabled()
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/",
            "/admin",
            "/dashboard",
            "/login",
            "/register",
            "/submit",
            "/verify",
            "/explore?",
          ],
        }
      : { userAgent: "*", disallow: "/" },
    ...(indexingEnabled() ? { sitemap: `${siteUrl()}/sitemap.xml` } : {}),
  };
}
