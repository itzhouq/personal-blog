import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "content", "about.md"),
    "utf8",
  );
  const html = renderMarkdown(md);

  return (
    <div className="py-12">
      <div className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar-192.png"
          alt="搞副业的老周itzhouq"
          width={80}
          height={80}
          className="h-20 w-20 rounded-2xl"
        />
        <h1 className="text-3xl font-bold">关于我</h1>
      </div>
      <div
        className="prose prose-stone dark:prose-invert mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* 微信生态入口：公众号 + 个人微信号 */}
      <div id="wechat" className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-xl font-bold">微信上找我</h2>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">公众号：{site.wechat.officialAccount}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              打开微信搜一搜即可关注，副业实验复盘与博客同步更新，不定期发独家踩坑记录。
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.wechat.scanSearchBanner}
              alt={`微信扫码或搜一搜：${site.wechat.officialAccount}`}
              width={1200}
              height={335}
              loading="lazy"
              className="mt-3 w-full rounded-lg"
            />
          </div>
          <div className="shrink-0 text-center sm:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.wechat.contactCard}
              alt={`${site.wechat.officialAccount} 个人微信号二维码`}
              width={176}
              height={262}
              loading="lazy"
              className="mx-auto w-44 rounded-lg border border-[var(--border)]"
            />
            <p className="mt-2 text-sm text-[var(--muted)]">扫码加我个人微信，交流 AI Agent 副业</p>
          </div>
        </div>
      </div>
    </div>
  );
}
