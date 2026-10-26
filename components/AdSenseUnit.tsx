import { site } from "@/site.config";

/**
 * Google AdSense 广告位（文章页用）。
 * site.adsense.clientId 留空时返回 null——页面上不会有任何广告痕迹。
 * 启用步骤见 docs/adsense-setup.md。
 */
export default function AdSenseUnit({ slot }: { slot?: string }) {
  const clientId = site.adsense.clientId;
  if (!clientId) return null;

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-[var(--border)]">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        {...(slot ? { "data-ad-slot": slot } : { "data-ad-format": "auto", "data-full-width-responsive": "true" })}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </div>
  );
}
