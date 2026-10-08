"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Config = {
  baseURL: string;
  apiKey: string;
  model: string;
  system: string;
};

const STORAGE_KEY = "chat.config.v1";
const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]";

export default function ChatPage() {
  const [cfg, setCfg] = useState<Config>({
    baseURL: "",
    apiKey: "",
    model: "",
    system: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cfgOpen, setCfgOpen] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 配置本地持久化（含 API Key，仅存本机浏览器）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCfg({ ...{ baseURL: "", apiKey: "", model: "", system: "" }, ...JSON.parse(saved) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      } catch {}
    }
  }, [cfg, loaded]);

  // 新消息自动滚到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (!cfg.baseURL || !cfg.apiKey) {
      setError("请先在上方填入 API 端点（Base URL）和 API Key");
      return;
    }
    const userMsg: Msg = { role: "user", content: text };
    const msgs = [...history, userMsg];
    setHistory([...msgs, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setLoading(true);

    const payloadMsgs = cfg.system
      ? [{ role: "system", content: cfg.system }, ...msgs]
      : msgs;
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch(cfg.baseURL.replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        signal: ac.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model || "auto",
          stream: true,
          messages: payloadMsgs,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}：${body.slice(0, 300) || res.statusText}`);
      }

      const contentType = res.headers.get("content-type") || "";
      let full = "";
      if (contentType.includes("text/event-stream") && res.body) {
        // 流式：逐行解析 SSE，把 delta.content 追加到最后一条助手消息
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const s = line.trim();
            if (!s.startsWith("data:")) continue;
            const payload = s.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                setHistory((h) => {
                  const c = [...h];
                  c[c.length - 1] = { role: "assistant", content: full };
                  return c;
                });
              }
            } catch {}
          }
        }
      } else {
        const j = await res.json();
        full = j?.choices?.[0]?.message?.content ?? "（无内容）";
      }
      setHistory((h) => {
        const c = [...h];
        c[c.length - 1] = { role: "assistant", content: full || "（空响应）" };
        return c;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setHistory((h) => h); // 用户主动停止，保留已生成的部分
      } else {
        setError(e instanceof Error ? e.message : String(e));
        // 出错时移除末尾的空助手占位
        setHistory((h) => (h[h.length - 1]?.content === "" ? h.slice(0, -1) : h));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  const ready = cfg.baseURL && cfg.apiKey;

  return (
    <div className="flex h-[calc(100dvh-14rem)] min-h-[32rem] flex-col">
      {/* 连接配置 */}
      <details
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm"
        open={cfgOpen}
        onToggle={(e) => setCfgOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer select-none font-medium">
          连接配置 {ready && <span className="ml-1 text-xs text-[var(--muted)]">（已保存到本机浏览器）</span>}
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-[var(--muted)]">API 端点（OpenAI 兼容 Base URL）</span>
            <input
              className={inputCls}
              value={cfg.baseURL}
              onChange={(e) => setCfg({ ...cfg, baseURL: e.target.value })}
              placeholder="例如 https://api.openai.com/v1"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-[var(--muted)]">API Key</span>
            <input
              className={inputCls}
              type="password"
              value={cfg.apiKey}
              onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
              placeholder="sk-…"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-[var(--muted)]">模型（留空 = auto 自动路由）</span>
            <input
              className={inputCls}
              value={cfg.model}
              onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
              placeholder="auto"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-[var(--muted)]">系统提示词（可选）</span>
            <input
              className={inputCls}
              value={cfg.system}
              onChange={(e) => setCfg({ ...cfg, system: e.target.value })}
              placeholder="你是一个乐于助人的 AI 助手。"
            />
          </label>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          Key 仅保存在你自己的浏览器（localStorage），不经过任何第三方。若请求报
          CORS 跨域错误，说明该端点未开放浏览器直连。
        </p>
      </details>

      {/* 对话区 */}
      <div ref={scrollRef} className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        {history.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--muted)]">
            <p className="text-2xl">💬</p>
            <p>填好连接配置后，开始和 AI 聊天吧</p>
            <p className="text-xs">支持流式输出 · 多轮对话 · Ctrl + Enter 发送</p>
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-[var(--accent)] text-white"
                  : "rounded-bl-sm border border-[var(--border)] bg-[var(--bg)]"
              }`}
            >
              {m.content || (loading && i === history.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
        {error && (
          <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs text-[var(--accent)]">
            {error}
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="mt-4 flex items-end gap-2">
        <textarea
          className={`${inputCls} flex-1 resize-none`}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="输入消息，Ctrl + Enter 发送…"
          disabled={loading}
        />
        {loading ? (
          <button
            onClick={() => abortRef.current?.abort()}
            className="h-[3.25rem] rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            停止
          </button>
        ) : (
          <button
            onClick={send}
            disabled={!input.trim()}
            className="h-[3.25rem] rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            发送
          </button>
        )}
        {history.length > 0 && !loading && (
          <button
            onClick={() => {
              setHistory([]);
              setError("");
            }}
            className="h-[3.25rem] rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            title="清空对话"
          >
            清空
          </button>
        )}
      </div>
    </div>
  );
}
