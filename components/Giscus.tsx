"use client";

import { useEffect, useRef } from "react";
import { site } from "@/site.config";

/** giscus 评论：在 site.config.ts 填入 repo 信息后自动开启 */
export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = site.giscus;
    if (!g.repo || !g.repoId || !ref.current) return;
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", g.repo);
    s.setAttribute("data-repo-id", g.repoId);
    s.setAttribute("data-category", g.category);
    s.setAttribute("data-category-id", g.categoryId);
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "preferred_color_scheme");
    s.setAttribute("data-lang", "zh-CN");
    ref.current.appendChild(s);
  }, []);

  if (!site.giscus.repo) return null;
  return (
    <div className="mt-12 border-t border-[var(--border)] pt-8">
      <div ref={ref} />
    </div>
  );
}
