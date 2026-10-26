#!/usr/bin/env node
/**
 * 构建期生成文章 OG 分享图（1200×630 PNG → public/og/<slug>.png）。
 * 纯 SVG 模板 + resvg 渲染，用系统字体（macOS 的 PingFang SC），无需下载字体文件。
 * 顺带按 site.adsense.clientId 生成/清理 public/ads.txt。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Resvg } from "@resvg/resvg-js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const postsDir = path.join(repoRoot, "content", "posts");
const outDir = path.join(repoRoot, "public", "og");

// 与 site.config.ts 保持一致（脚本里避免引入 TS 依赖，用正则取值）
const cfg = fs.readFileSync(path.join(repoRoot, "site.config.ts"), "utf8");
const siteName = cfg.match(/name:\s*"([^"]+)"/)?.[1] ?? "Build in Public";
const siteUrl = cfg.match(/siteUrl:\s*"([^"]+)"/)?.[1] ?? "";
const domain = siteUrl.replace(/^https?:\/\//, "");
const accent = "#c73e3a";
const bg = "#faf8f5";
const muted = "#78716c";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 标题换行：中文逐字、英文按词，最多 maxLines 行 */
function wrapTitle(title, maxCharsPerLine = 17, maxLines = 3) {
  const tokens = [...title].reduce((acc, ch) => {
    if (/[a-zA-Z0-9]/.test(ch)) {
      if (acc.length && /[a-zA-Z0-9]$/.test(acc[acc.length - 1])) acc[acc.length - 1] += ch;
      else acc.push(ch);
    } else acc.push(ch);
    return acc;
  }, []);
  const lines = [];
  let cur = "";
  for (const t of tokens) {
    if ((cur + t).length > maxCharsPerLine && cur) {
      lines.push(cur.trimEnd());
      cur = t === " " ? "" : t;
    } else cur += t;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, "…");
  }
  return lines;
}

function ogSvg(title, date) {
  const lines = wrapTitle(title);
  const fontSize = lines.some((l) => l.length > 15) ? 52 : 60;
  const lineHeight = Math.round(fontSize * 1.35);
  const startY = 240;
  const text = lines
    .map(
      (l, i) =>
        `<text x="96" y="${startY + i * lineHeight}" font-family="PingFang SC, Hiragino Sans GB, sans-serif" font-size="${fontSize}" font-weight="700" fill="#1c1917">${esc(l)}</text>`,
    )
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${bg}"/>
  <rect x="0" y="0" width="1200" height="10" fill="${accent}"/>
  <rect x="96" y="150" width="64" height="10" fill="${accent}"/>
  <text x="96" y="110" font-family="PingFang SC, sans-serif" font-size="26" font-weight="600" fill="${accent}">${esc(siteName)}</text>
  ${text}
  <line x1="96" y1="530" x2="1104" y2="530" stroke="#e7e2dc" stroke-width="2"/>
  <text x="96" y="575" font-family="PingFang SC, sans-serif" font-size="26" fill="${muted}">${esc(date)}</text>
  <text x="1104" y="575" text-anchor="end" font-family="PingFang SC, sans-serif" font-size="26" font-weight="600" fill="${muted}">${esc(domain)}</text>
</svg>`;
}

// 1) 收集文章（生产语义：跳过 draft）
const slugs = [];
for (const f of fs.readdirSync(postsDir)) {
  if (!f.endsWith(".md")) continue;
  const { data } = matter(fs.readFileSync(path.join(postsDir, f), "utf8"));
  if (data.draft !== true) slugs.push(f.slice(0, -3));
}

// 2) 渲染 OG 图（清理已不存在的旧图）
fs.mkdirSync(outDir, { recursive: true });
for (const old of fs.readdirSync(outDir)) {
  if (old.endsWith(".png") && !slugs.includes(old.replace(/\.png$/, ""))) {
    fs.rmSync(path.join(outDir, old));
  }
}
let n = 0;
for (const slug of slugs) {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data } = matter(raw);
  const title = typeof data.title === "string" ? data.title : slug;
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : (data.date ?? "");
  const svg = ogSvg(title, date);
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { loadSystemFonts: true, defaultFontFamily: "PingFang SC" },
  }).render().asPng();
  fs.writeFileSync(path.join(outDir, `${slug}.png`), png);
  n++;
}
console.log(`[og] 生成 ${n} 张 OG 图 → public/og/`);

// 3) ads.txt：有 clientId 就生成，没有就清掉，避免留一份过期的
const clientId = cfg.match(/clientId:\s*"([^"]*)"/)?.[1] ?? "";
const adsTxt = path.join(repoRoot, "public", "ads.txt");
if (clientId) {
  fs.writeFileSync(adsTxt, `google.com, ${clientId}, DIRECT, f08c47fec0942fa0\n`);
  console.log(`[og] ads.txt 已生成（${clientId}）`);
} else if (fs.existsSync(adsTxt)) {
  fs.rmSync(adsTxt);
  console.log("[og] ads.txt 已移除（未配置 AdSense）");
}
