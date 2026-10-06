import type { NextConfig } from "next";

/**
 * 纯静态导出：所有页面 SSG、路由处理器均为 force-static，
 * 产物在 out/ 目录，可直接托管到 Cloudflare Pages / 任何静态服务。
 * 注意：导出模式不支持 SSR/ISR/中间件，需要服务端能力时再改回来。
 */
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
