import type { Metadata } from "next";
import { getAllPosts, toMeta } from "@/lib/posts";
import { yearOf } from "@/lib/format";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "文章",
  description: "全部文章归档",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts().map(toMeta);
  const years = [...new Set(posts.map((p) => yearOf(p.date)))];

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">全部文章</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {posts.length} 篇 · 持续更新</p>

      {years.map((y) => (
        <section key={y} className="mt-10">
          <h2 className="text-lg font-bold text-[var(--accent)]">{y}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {posts
              .filter((p) => yearOf(p.date) === y)
              .map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
