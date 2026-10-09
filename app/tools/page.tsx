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
        我做的小工具和服务都会挂在这里；页面下方还内嵌了完整的在线工具箱。
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

      {/* 内嵌完整工具箱（tools.itzhouq.cn），数据与子域名站实时同步 */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">在线工具箱</h2>
          <a
            href="https://tools.itzhouq.cn"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            独立打开 →
          </a>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          全部纯前端、在浏览器本地运行、数据不上传——已直接嵌入下方，也可以独立打开。
        </p>
        <iframe
          src="https://tools.itzhouq.cn"
          title="在线工具箱"
          loading="lazy"
          className="mt-5 h-[820px] w-full rounded-xl border border-[var(--border)]"
        />
      </section>
    </div>
  );
}
