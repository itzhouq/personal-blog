import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-6xl font-bold text-[var(--accent)]">404</p>
      <p className="text-[var(--muted)]">页面走丢了……</p>
      <Link
        href="/"
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}
