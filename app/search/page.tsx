"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Item = {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  url: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setIdx)
      .catch(() => setIdx([]));
  }, []);

  const results = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return idx.filter((p) =>
      [p.title, p.summary, p.tags.join(" ")].join(" ").toLowerCase().includes(kw),
    );
  }, [q, idx]);

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">搜索</h1>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="输入关键词，如：Next.js、AI 工具…"
        className="mt-6 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
      />
      <ul className="mt-6 divide-y divide-[var(--border)]">
        {results.map((p) => (
          <li key={p.url}>
            <Link
              href={p.url}
              className="block py-3 transition-colors hover:text-[var(--accent)]"
            >
              <span className="font-medium">{p.title}</span>
              <span className="ml-2 text-xs text-[var(--muted)]">{p.date}</span>
            </Link>
          </li>
        ))}
      </ul>
      {q.trim() && results.length === 0 && (
        <p className="mt-6 text-sm text-[var(--muted)]">没有找到相关文章。</p>
      )}
      {!q.trim() && idx.length > 0 && (
        <p className="mt-6 text-sm text-[var(--muted)]">共收录 {idx.length} 篇文章。</p>
      )}
    </div>
  );
}
