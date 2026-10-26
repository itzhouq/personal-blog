import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { getAllPosts } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.tools.filter((t) => t.slug).map((t) => ({ slug: t.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = site.tools.find((t) => t.slug === slug);
  if (!tool) return {};
  return {
    title: `${tool.title} · 工具`,
    description: tool.desc,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = site.tools.find((t) => t.slug === slug);
  if (!tool) notFound();

  const tutorial = tool.tutorial ? getAllPosts().find((p) => p.slug === tool.tutorial) : undefined;

  return (
    <div className="py-12">
      <nav className="text-sm text-[var(--muted)]">
        <a href="/tools" className="transition-colors hover:text-[var(--accent)]">
          工具
        </a>
        <span aria-hidden> / </span>
        <span>{tool.title}</span>
      </nav>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{tool.title}</h1>
          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            {tool.badge}
          </span>
        </div>
        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)]">{tool.desc}</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        {tool.href ? (
          <a
            href={tool.href}
            {...(!tool.href.startsWith("/") ? { target: "_blank", rel: "noreferrer" } : {})}
            className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            打开 {tool.title} {tool.href.startsWith("/") ? "" : "↗"}
          </a>
        ) : null}
        {tool.repo && (
          <a
            href={tool.repo}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            GitHub 仓库 ↗
          </a>
        )}
      </div>

      {tool.points && tool.points.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold">它能做什么</h2>
          <ul className="mt-4 space-y-2.5">
            {tool.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-0.5 text-[var(--accent)]" aria-hidden>
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold">教程与复盘</h2>
        {tutorial ? (
          <Link
            href={`/blog/${tutorial.slug}`}
            className="mt-4 block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--accent)] hover:shadow-sm"
          >
            <p className="font-semibold transition-colors hover:text-[var(--accent)]">
              {tutorial.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{tutorial.summary}</p>
          </Link>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
            详细教程正在写，先蹲住
            <Link href="/rss.xml" className="mx-1 underline underline-offset-2 hover:text-[var(--accent)]">
              RSS
            </Link>
            或公众号第一时间获取。
          </p>
        )}
      </section>
    </div>
  );
}
