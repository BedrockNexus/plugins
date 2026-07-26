import { fetchQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { api } from "../../convex/_generated/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await fetchQuery(api.functions.site.catalog.sitemapEntries, {});
  const publicRoutes: MetadataRoute.Sitemap = ["", "/explore", "/software"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...publicRoutes,
    ...entries.software.map((item) => ({
      url: `${siteConfig.url}/software/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...entries.projects.map((item) => ({
      url: `${siteConfig.url}/projects/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...entries.creators.map((item) => ({
      url: `${siteConfig.url}/creators/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...entries.organizations.map((item) => ({
      url: `${siteConfig.url}/organizations/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
