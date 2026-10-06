import Link from "next/link";

export default function TagBadge({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      #{tag}
      {typeof count === "number" ? ` · ${count}` : ""}
    </Link>
  );
}
