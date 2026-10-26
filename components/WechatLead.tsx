import Link from "next/link";
import { site } from "@/site.config";

/**
 * 公众号领取钩子（文章底部 CTA）：
 * 引导关注公众号回复关键词，领取 leadMagnet 工具包。
 */
export default function WechatLead() {
  const { officialAccount, scanSearchBanner } = site.wechat;
  const { keyword, packageName } = site.leadMagnet;

  return (
    <aside className="mt-10 flex flex-col gap-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">免费领取 {packageName}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          关注公众号「{officialAccount}」，后台回复「
          <span className="font-semibold text-[var(--accent)]">{keyword}</span>
          」，自动收到下载链接。
          <Link href="/wechat" className="ml-1 underline underline-offset-2 hover:text-[var(--accent)]">
            领取说明 →
          </Link>
        </p>
      </div>
      <Link href="/wechat" className="shrink-0 self-start sm:self-center" aria-label="公众号领取说明">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scanSearchBanner}
          alt={`公众号 ${officialAccount} 二维码`}
          width={96}
          height={96}
          className="h-24 w-24 rounded-lg border border-[var(--border)]"
          loading="lazy"
        />
      </Link>
    </aside>
  );
}
