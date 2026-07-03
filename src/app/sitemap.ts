import type { MetadataRoute } from "next";
import { getAllRoots } from "@/lib/roots";
import { SITE_URL, rootUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const rootPages: MetadataRoute.Sitemap = getAllRoots().map((entry) => ({
    url: rootUrl(entry.root),
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...rootPages];
}
