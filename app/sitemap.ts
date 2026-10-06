import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/site.config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog", "/tags", "/tools", "/about"].map((p) => ({
    url: `${site.siteUrl}${p}`,
    lastModified: new Date(),
  }));
  const posts = getAllPosts().map((p) => ({
    url: `${site.siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  return [...pages, ...posts];
}
