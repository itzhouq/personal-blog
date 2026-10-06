import { getAllPosts, toMeta } from "@/lib/posts";

export const dynamic = "force-static";

export function GET() {
  const items = getAllPosts()
    .map(toMeta)
    .map(({ slug, title, date, tags, summary }) => ({
      title,
      date,
      tags,
      summary,
      url: `/blog/${slug}`,
    }));
  return Response.json(items);
}
