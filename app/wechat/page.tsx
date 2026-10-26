import type { Metadata } from "next";
import { site } from "@/site.config";
import CopyKeyword from "@/components/CopyKeyword";

export const metadata: Metadata = {
  title: "领取《出海自动化工具包》",
  description:
    "关注公众号「搞副业的老周itzhouq」，回复「出海」自动领取：GSC 收录加速、GSC 数据导出、Adsterra 接入等自动化 skill 与出海自查清单。",
  alternates: { canonical: "/wechat" },
};

const steps = [
  {
    title: "① 关注公众号",
    desc: "微信扫码，或在公众号搜一搜里搜「搞副业的老周itzhouq」。",
  },
  {
    title: "② 回复关键词",
    desc: "在公众号后台发送关键词（点下方按钮复制），机器人秒回下载链接。",
  },
  {
    title: "③ 下载解压即用",
    desc: "压缩包里是 SKILL.md 形式的技能包，丢给任意 AI 编码助手即可按说明执行。",
  },
];

export default function WechatPage() {
  const { officialAccount, searchBanner, scanSearchBanner } = site.wechat;
  const { keyword, packageName, items } = site.leadMagnet;

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">免费领取 {packageName}</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        我把日常出海建站用的自动化 skill 和自查清单打包了一份，不用转发、不用注册——关注公众号回复关键词就能拿到。
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="font-semibold">{s.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
            <p className="text-sm text-[var(--muted)]">在公众号后台回复</p>
            <p className="mt-1 text-2xl font-bold text-[var(--accent)]">「{keyword}」</p>
            <div className="mt-4">
              <CopyKeyword keyword={keyword} />
            </div>
          </div>
        </div>

        <aside className="lg:w-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scanSearchBanner}
            alt={`公众号 ${officialAccount} 二维码，扫码或搜一搜关注`}
            width={288}
            className="w-full rounded-xl border border-[var(--border)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={searchBanner}
            alt={`微信搜一搜 ${officialAccount}`}
            width={288}
            className="mt-3 w-full rounded-xl border border-[var(--border)]"
            loading="lazy"
          />
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold">包里有什么</h2>
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="mt-0.5 text-[var(--accent)]" aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-4 text-xs leading-relaxed text-[var(--muted)]">
          说明：工具包会不定期更新，重新回复关键词即可拿到最新版。你的关注数据只用于公众号消息推送，不会被收集或转卖。
        </p>
      </section>
    </div>
  );
}
