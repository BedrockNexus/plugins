import type { MetadataRoute } from "next";

import { siteConfig, softwareCatalog } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/explore", "/software"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? ("weekly" as const) : ("daily" as const),
    priority: path === "" ? 1 : 0.8,
  }));

  const softwareRoutes = softwareCatalog.map((software) => ({
    url: `${siteConfig.url}/software/${software.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...publicRoutes, ...softwareRoutes];
}
