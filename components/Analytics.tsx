import Script from "next/script";
import { site } from "@/site.config";

/**
 * 统计接入（可叠加）：
 * - umami 自托管：填 analytics.umamiSrc + umamiId
 * - Cloudflare Web Analytics：填 analytics.cfBeaconToken（免费零维护，
 *   PV/UV 数据后续用 worklog/scripts/pull-cf-analytics.mjs 自动拉进台账）
 */
export default function Analytics() {
  const umami =
    site.analytics.umamiSrc && site.analytics.umamiId ? (
      <Script
        defer
        src={site.analytics.umamiSrc}
        data-website-id={site.analytics.umamiId}
      />
    ) : null;
  const cf = site.analytics.cfBeaconToken ? (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: site.analytics.cfBeaconToken })}
    />
  ) : null;
  return (
    <>
      {umami}
      {cf}
    </>
  );
}
