import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content/server";
import { absoluteUrl } from "@/lib/utils/site";
import { services as serviceItems } from "@/lib/data/services";

export const dynamic = "force-static";

/**
 * Static sitemap — no blog API calls in cPanel/static-export mode.
 * Blog entries will be added here once static articles are created.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  void (await getSiteContent()); // kept for compatibility but content is static

  const staticRoutes = [
    "/",
    "/about",
    "/services",
    "/solutions",
    "/industries",
    "/projects",
    "/partners",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" ? 0.2 : 0.7,
    })),
    ...serviceItems.map((s) => ({
      url: absoluteUrl(`/services/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
