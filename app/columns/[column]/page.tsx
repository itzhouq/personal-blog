import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { getPostsByColumn, toMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.columns.map((c) => ({ column: c.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ column: string }>;
}): Promise<Metadata> {
  const { column } = await params;
  const def = site.columns.find((c) => c.key === column);
  if (!def) return {};
  return {
    title: `${def.name} · 栏目`,
    description: def.description,
    alternates: { canonical: `/columns/${def.key}` },
  };
}

export default async function ColumnPage({
  params,
}: {
  params: Promise<{ column: string }>;
}) {
  const { column } = await params;
  const def = site.columns.find((c) => c.key === column);
  if (!def) notFound();

  const posts = getPostsByColumn(def.key).map(toMeta);

  return (
    <div className="py-12">
      <nav className="text-sm text-[var(--muted)]">
        <a href="/columns" className="transition-colors hover:text-[var(--accent)]">
          栏目
        </a>
        <span aria-hidden> / </span>
        <span>{def.name}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-bold">
        {def.name}
        <span className="ml-3 align-middle text-base font-normal text-[var(--muted)]">
          共 {posts.length} 篇
        </span>
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">{def.description}</p>

      {posts.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          这个栏目正在攒稿，敬请期待。
        </p>
      )}
    </div>
  );
}
