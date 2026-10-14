import Link from "next/link";
import { site } from "@/site.config";

// 给 AI agent 的入口：预填提示词，让 ChatGPT/Claude 等带着任务来读站。
const agentPrompt =
  "Who is 老周 (itzhouq)? Based on https://itzhouq.cn — a 10-year backend developer, self-taught from rural Hubei, now in Shanghai, building AI Agent side projects in public. Summarize who he is, what he is currently building, what his monetization experiments have earned so far, and which blog posts are worth reading first. Explain how the blog is organized.";

const askAiLinks = [
  { label: "ChatGPT", href: `https://chatgpt.com/?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Claude", href: `https://claude.ai/new?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Perplexity", href: `https://www.perplexity.ai/search?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Gemini", href: `https://gemini.google.com/app?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Grok", href: `https://grok.com/?q=${encodeURIComponent(agentPrompt)}` },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Agents
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          给 AI 的站点说明见{" "}
          <Link href="/llms.txt" className="text-[var(--accent)] underline underline-offset-2">
            llms.txt
          </Link>
          ；也可以看看各家 AI 怎么介绍本站：
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {askAiLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
            >
              {l.label}
            </a>
          ))}
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 border-t border-[var(--border)] px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.author} · Build in Public
        </p>
        <div className="flex items-center gap-4">
          <Link href="/rss.xml" className="transition-colors hover:text-[var(--accent)]">
            RSS
          </Link>
          <a href={site.social.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            GitHub
          </a>
          <a href={site.social.repo} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            本站源码
          </a>
          <a href={site.social.x} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--accent)]">
            X
          </a>
          <Link href="/about#wechat" className="transition-colors hover:text-[var(--accent)]">
            公众号
          </Link>
          <Link href="/search" className="transition-colors hover:text-[var(--accent)]">
            搜索
          </Link>
        </div>
      </div>
    </footer>
  );
}
