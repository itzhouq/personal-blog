import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getAdjacent } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import Toc from "@/components/Toc";
import TagBadge from "@/components/TagBadge";
import Giscus from "@/components/Giscus";
import CodeCopy from "@/components/CodeCopy";

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

  return (
    <div className="flex gap-10 py-12">
      <article className="min-w-0 flex-1">
        <header>
          <p className="text-sm text-[var(--muted)]">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden> · </span>
            <span>{post.readingTime}</span>
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

        <div
          className="prose prose-stone dark:prose-invert mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

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
