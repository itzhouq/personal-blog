import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "工具",
  description: "我做的小工具与服务",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">小工具 & 服务</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        这里会陆续挂上我做的小工具和正在运营的服务——都建立在本站的自建
        AI 网关之上，敬请期待。
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {site.tools.map((t) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t.title}</h2>
                <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                  {t.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t.desc}</p>
            </>
          );
          return t.href.startsWith("/") ? (
            <Link
              key={t.title}
              href={t.href}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-sm"
            >
              {inner}
            </Link>
          ) : t.href ? (
            <a
              key={t.title}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-sm"
            >
              {inner}
            </a>
          ) : (
            <div
              key={t.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 opacity-80"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
