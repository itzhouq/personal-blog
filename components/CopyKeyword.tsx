"use client";

import { useState } from "react";

/** 关键词复制按钮：点击复制 + 「已复制」反馈 */
export default function CopyKeyword({ keyword }: { keyword: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(keyword);
        } catch {
          // 剪贴板不可用（如 http 环境）时静默失败，用户仍可手动输入
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      {copied ? "✓ 已复制，去公众号粘贴" : `复制关键词「${keyword}」`}
    </button>
  );
}
