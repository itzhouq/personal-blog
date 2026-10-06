import Link from "next/link";
import { site } from "@/site.config";
import { getAllPosts, toMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function RssIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

const socialLinks = [
  { href: site.social.github, label: "GitHub", icon: <GitHubIcon /> },
  { href: site.social.x, label: "X / Twitter", icon: <XIcon /> },
  { href: `mailto:${site.email}`, label: "Email", icon: <MailIcon /> },
  { href: "/rss.xml", label: "RSS 订阅", icon: <RssIcon /> },
];

export default function Home() {
  const posts = getAllPosts().map(toMeta);
  const latest = posts.slice(0, 3);

  return (
    <div className="py-12 sm:py-16">
      {/* Hero */}
      <section>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          你好，我是 <span className="text-[var(--accent)]">{site.author}</span> 👋
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
          {site.description}
          。这里记录我的想法、踩坑与产品进展——所有过程公开，欢迎围观与交流。
        </p>
        <div className="mt-6 flex items-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              aria-label={s.label}
              title={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </section>

      {/* Build in Public 路线图 */}
      <section className="mt-14 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">🚧 正在构建</h2>
          <span className="text-xs text-[var(--muted)]">build in public</span>
        </div>
        <ul className="mt-4 space-y-2.5 text-sm">
          {site.roadmap.map((item) => (
            <li key={item.text} className="flex items-start gap-2.5">
              <span aria-hidden>{item.done ? "✅" : "🚧"}</span>
              <span className={item.done ? "text-[var(--muted)] line-through" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 最新文章 */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">最新文章</h2>
          <Link
            href="/blog"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            查看全部 →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>

      {/* 工具预告 */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">小工具 & 服务</h2>
          <Link
            href="/tools"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            全部工具 →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {site.tools.slice(0, 3).map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-dashed border-[var(--border)] p-5"
            >
              <p className="font-medium">{t.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
