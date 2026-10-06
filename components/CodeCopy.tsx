"use client";

import { useEffect } from "react";

/** 为文章内代码块注入复制按钮（渐进增强，SSR 无 JS 时只是没有按钮） */
export default function CodeCopy() {
  useEffect(() => {
    const pres = Array.from(document.querySelectorAll<HTMLPreElement>(".prose pre"));
    const cleanups: Array<() => void> = [];
    for (const pre of pres) {
      if (pre.querySelector(".code-copy")) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "code-copy absolute right-2 top-2 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-xs text-white/70 transition-colors hover:text-white";
      btn.textContent = "复制";
      const onClick = async () => {
        const code = pre.querySelector("code");
        if (!code) return;
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = "已复制";
          setTimeout(() => (btn.textContent = "复制"), 1500);
        } catch {
          /* 剪贴板权限被拒时忽略 */
        }
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
