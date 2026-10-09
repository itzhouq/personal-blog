import Link from "next/link";
import { site } from "@/site.config";

/** 文末「关于作者」卡片：所有文章自动渲染，统一 IP 形象与关注引导 */
export default function AuthorCard() {
  return (
    <aside className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar-192.png"
          alt={site.author}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="font-semibold">{site.author}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            10 年后端程序员：湖北农村自学编程出来，人在上海写代码带娃。
            用 AI Agent 把副业当实验做，流量和收入数据全部公开，失败了也发。
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        <li>
          <span className="text-[var(--muted)]">实时进展：</span>
          <a
            href={site.social.x}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            X @itzhouq2026
          </a>
          <span className="text-[var(--muted)]">（每周五「副业实验周报」连载）</span>
        </li>
        <li>
          <span className="text-[var(--muted)]">代码与工具：</span>
          <a
            href={site.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            GitHub @itzhouq
          </a>
          <span className="text-[var(--muted)]"> · </span>
          <Link href="/tools" className="font-medium text-[var(--accent)] hover:underline">
            在线工具箱
          </Link>
        </li>
        <li>
          <span className="text-[var(--muted)]">不错过更新：</span>
          <Link href="/rss.xml" className="font-medium text-[var(--accent)] hover:underline">
            RSS 全文订阅
          </Link>
        </li>
      </ul>

      <p className="mt-4 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted)]">
        这里全是普通人折腾出来的一手经验。如果这篇帮你省了时间，关注一下就是最好的支持。
      </p>

      {/* 微信关注引导：公众号搜一搜 + 个人微信号 */}
      <div className="mt-4 flex flex-col gap-4 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">公众号：{site.wechat.officialAccount}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            微信搜一搜即可关注，副业实验复盘同步更新。
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.wechat.searchBanner}
            alt={`微信搜一搜：${site.wechat.officialAccount}`}
            width={600}
            height={77}
            loading="lazy"
            className="mt-3 w-full max-w-xs rounded-md"
          />
        </div>
        <div className="shrink-0 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.wechat.contactQr}
            alt="个人微信号二维码"
            width={96}
            height={96}
            loading="lazy"
            className="mx-auto h-24 w-24 rounded-lg border border-[var(--border)]"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">扫码加我微信</p>
        </div>
      </div>
    </aside>
  );
}
