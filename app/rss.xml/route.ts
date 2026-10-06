import { getAllPosts } from "@/lib/posts";
import { site } from "@/site.config";

export const dynamic = "force-static";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cdata(s: string) {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export function GET() {
  const items = getAllPosts()
    .map(
      (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${site.siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site.siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${cdata(p.summary || "")}</description>
      <content:encoded>${cdata(p.html)}</content:encoded>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${esc(site.title)}</title>
  <link>${site.siteUrl}</link>
  <description>${esc(site.description)}</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
