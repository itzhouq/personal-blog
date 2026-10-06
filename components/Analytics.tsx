import Script from "next/script";
import { site } from "@/site.config";

/** umami 自托管统计：在 site.config.ts 填入地址后自动开启 */
export default function Analytics() {
  if (!site.analytics.umamiSrc || !site.analytics.umamiId) return null;
  return (
    <Script
      defer
      src={site.analytics.umamiSrc}
      data-website-id={site.analytics.umamiId}
    />
  );
}
