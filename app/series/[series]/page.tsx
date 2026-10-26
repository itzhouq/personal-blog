import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { getPostsBySeries, toMeta } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.series.map((s) => ({ series: s.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> {
  const { series } = await params;
  const def = site.series.find((s) => s.key === series);
  if (!def) return {};
  return {
    title: `${def.name} · 系列`,
    description: def.description,
    alternates: { canonical: `/series/${def.key}` },
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  const def = site.series.find((s) => s.key === series);
  if (!def) notFound();

  const posts = getPostsBySeries(def.key).map(toMeta);
  const latest = posts[posts.length - 1];

  return (
    <div className="py-12">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <p className="text-sm font-medium text-[var(--accent)]">连载系列</p>
        <h1 className="mt-2 text-3xl font-bold">{def.name}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)]">{def.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            已更 {posts.length} 期
          </span>
          {latest && (
            <span>
              最新：{latest.title} · {formatDate(latest.date)}
            </span>
          )}
        </div>
      </div>

      {posts.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold">系列目录</h2>
          <ol className="mt-4 space-y-3">
            {posts.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex items-baseline gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--accent)] hover:shadow-sm"
                >
                  <span className="shrink-0 font-mono text-sm text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug transition-colors group-hover:text-[var(--accent)]">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {formatDate(p.date)} · {p.readingTime}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          第一期正在路上，敬请期待。
        </p>
      )}
    </div>
  );
}
