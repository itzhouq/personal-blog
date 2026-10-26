import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { getAllPosts, getPostBySlug, getAdjacent, getPostsBySeries, toMeta } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import Toc from "@/components/Toc";
import TagBadge from "@/components/TagBadge";
import Giscus from "@/components/Giscus";
import CodeCopy from "@/components/CodeCopy";
import AuthorCard from "@/components/AuthorCard";
import WechatLead from "@/components/WechatLead";
import AdSenseUnit from "@/components/AdSenseUnit";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const ogImages = [`/og/${post.slug}.png`];
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: ogImages,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const { prev, next } = getAdjacent(slug);
  const columnDef = post.column ? site.columns.find((c) => c.key === post.column) : undefined;
  const seriesDef = post.series ? site.series.find((s) => s.key === post.series) : undefined;
  const seriesPosts = post.series ? getPostsBySeries(post.series).map(toMeta) : [];

  return (
    <div className="flex gap-10 py-12">
      <article className="min-w-0 flex-1">
        <header>
          <p className="text-sm text-[var(--muted)]">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden> · </span>
            <span>{post.readingTime}</span>
            {columnDef && (
              <>
                <span aria-hidden> · </span>
                <Link
                  href={`/columns/${columnDef.key}`}
                  className="font-medium text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  {columnDef.name}
                </Link>
              </>
            )}
            {seriesDef && (
              <>
                <span aria-hidden> · </span>
                <Link
                  href={`/series/${seriesDef.key}`}
                  className="font-medium text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  {seriesDef.name}
                </Link>
              </>
            )}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <TagBadge key={t} tag={t} />
              ))}
            </div>
          )}
        </header>

        {seriesDef && seriesPosts.length > 1 && (
          <nav
            aria-label="系列目录"
            className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {seriesDef.name}
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  连载中 · 已更 {seriesPosts.length} 期
                </span>
              </span>
              <Link
                href={`/series/${seriesDef.key}`}
                className="shrink-0 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                系列主页 →
              </Link>
            </div>
            <ol className="mt-3 space-y-1.5">
              {seriesPosts.map((p, i) => (
                <li key={p.slug} className="flex items-baseline gap-2.5">
                  <span
                    className={`font-mono text-xs ${p.slug === post.slug ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.slug === post.slug ? (
                    <span className="font-medium text-[var(--accent)]">{p.title}</span>
                  ) : (
                    <Link
                      href={`/blog/${p.slug}`}
                      className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                    >
                      {p.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="prose prose-stone dark:prose-invert mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <AdSenseUnit />
        <WechatLead />

        <AuthorCard />

        <nav className="mt-12 grid gap-4 border-t border-[var(--border)] pt-6 text-sm sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group rounded-lg border border-[var(--border)] p-4 transition-colors hover:border-[var(--accent)]"
            >
              <p className="text-xs text-[var(--muted)]">← 更新一篇</p>
              <p className="mt-1 font-medium transition-colors group-hover:text-[var(--accent)]">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="group rounded-lg border border-[var(--border)] p-4 text-right transition-colors hover:border-[var(--accent)] sm:col-start-2"
            >
              <p className="text-xs text-[var(--muted)]">更旧一篇 →</p>
              <p className="mt-1 font-medium transition-colors group-hover:text-[var(--accent)]">
                {next.title}
              </p>
            </Link>
          )}
        </nav>

        <Giscus />
      </article>

      <Toc items={post.headings} />
      <CodeCopy />
    </div>
  );
}
