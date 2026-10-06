import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostMeta } from "@/lib/types";
import TagBadge from "./TagBadge";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--accent)] hover:shadow-sm">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
      </div>
      <h2 className="mt-2 text-lg font-semibold leading-snug">
        <Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-[var(--accent)]">
          {post.title}
        </Link>
      </h2>
      {post.summary && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{post.summary}</p>
      )}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
      )}
    </article>
  );
}
