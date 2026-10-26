import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site.config";
import { getPostsByColumn, toMeta } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "栏目",
  description: "按内容栏目浏览：实操复盘、工具教程、开源项目、白嫖与部署",
  alternates: { canonical: "/columns" },
};

export default function ColumnsIndex() {
  const columns = site.columns.map((c) => {
    const posts = getPostsByColumn(c.key).map(toMeta);
    return { ...c, posts };
  });

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">内容栏目</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        站内内容固定按四个栏目组织——找哪类内容，直接进对应栏目。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {columns.map((c) => (
          <Link
            key={c.key}
            href={`/columns/${c.key}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold transition-colors group-hover:text-[var(--accent)]">
                {c.name}
              </h2>
              <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                {c.posts.length} 篇
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{c.description}</p>
            {c.posts[0] && (
              <p className="mt-3 truncate text-xs text-[var(--muted)]">
                最新：{c.posts[0].title} · {formatDate(c.posts[0].date)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
