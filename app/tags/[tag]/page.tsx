import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag, toMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  return { title: `#${tag}`, description: `标签「${tag}」下的全部文章` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const posts = getPostsByTag(tag).map(toMeta);
  if (posts.length === 0) notFound();

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">
        #<span className="text-[var(--accent)]">{tag}</span>
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {posts.length} 篇</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
