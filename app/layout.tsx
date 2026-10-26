import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { site } from "@/site.config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: {
    types: { "application/rss+xml": `${site.siteUrl}/rss.xml` },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0c" },
  ],
};

/* 首帧前同步主题，避免深色模式闪白 */
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        {/* AdSense 加载器：site.adsense.clientId 填了才渲染（见 docs/adsense-setup.md） */}
        {site.adsense.clientId && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsense.clientId}`}
          />
        )}
        <Analytics />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
