import Link from "next/link";
import { site } from "@/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.author} · Build in Public
        </p>
        <div className="flex items-center gap-4">
          <Link href="/rss.xml" className="transition-colors hover:text-[var(--accent)]">
            RSS
          </Link>
          <a href={site.social.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            GitHub
          </a>
          <a href={site.social.repo} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            本站源码
          </a>
          <a href={site.social.x} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            X
          </a>
          <Link href="/search" className="transition-colors hover:text-[var(--accent)]">
            搜索
          </Link>
        </div>
      </div>
    </footer>
  );
}
