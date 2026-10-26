#!/usr/bin/env node
/**
 * 打包《出海自动化工具包》：agent-skills 里的出海相关 skill + 自查清单 → kit.zip
 * 产物：workers/wechat-mp/assets/kit.zip（公众号 Worker 的下载文件，不入 git）
 *
 * 红线：打包前对全部文件做密钥扫描，命中任何疑似密钥立即失败——
 * 这个 zip 是公开发放的，绝不能把私仓里的敏感内容带出去。
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const skillsRoot = path.resolve(repoRoot, "..", "agent-skills");
const stageDir = path.resolve(repoRoot, ".kit-stage");
const outDir = path.resolve(repoRoot, "workers", "wechat-mp", "assets");
const outFile = path.join(outDir, "kit.zip");

/** 打包进工具包的 skill（对应 site.config.leadMagnet.items 的承诺） */
const SKILLS = [
  "gsc-request-indexing",
  "gsc-performance-export",
  "gsc-intent-execute",
  "adsterra-integration",
  "connect-gsc",
  "connect-cf-web-analytics",
];

/** 疑似密钥模式：命中即中止。宁误报不漏报。 */
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /\bghp_[A-Za-z0-9]{30,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][A-Za-z0-9+/_-]{20,}["']/i,
];

function collectFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else out.push(full);
  }
  return out;
}

// 1) 清理并重建暂存目录
fs.rmSync(stageDir, { recursive: true, force: true });
fs.mkdirSync(stageDir, { recursive: true });

// 2) 收集 skill 文件（跳过符号链接——agent-skills 里有指向私仓的链接，不能带出去）
let missing = [];
for (const skill of SKILLS) {
  const src = path.join(skillsRoot, skill);
  if (!fs.existsSync(src)) {
    missing.push(skill);
    continue;
  }
  fs.mkdirSync(path.join(stageDir, skill), { recursive: true });
  for (const f of collectFiles(src)) {
    if (fs.lstatSync(f).isSymbolicLink()) continue;
    if (!/\.(md|sh|mjs|js|py)$/.test(f) && path.basename(f) !== "SKILL.md") continue;
    const dest = path.join(stageDir, skill, path.relative(src, f));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f, dest);
  }
}
if (missing.length > 0) {
  console.error(`[kit] agent-skills 缺少目录：${missing.join(", ")}（检查 ../agent-skills 是否已克隆）`);
  process.exit(1);
}

// 3) 自查清单
fs.copyFileSync(
  path.join(repoRoot, "scripts", "kit-assets", "出海自查清单.md"),
  path.join(stageDir, "出海自查清单.md"),
);

// 4) 密钥扫描
const offenders = [];
for (const f of collectFiles(stageDir)) {
  const text = fs.readFileSync(f, "utf8");
  for (const p of SECRET_PATTERNS) {
    if (p.test(text)) offenders.push(`${path.relative(stageDir, f)} 命中 ${p}`);
  }
}
if (offenders.length > 0) {
  console.error("[kit] 疑似密钥，禁止打包：\n" + offenders.join("\n"));
  process.exit(1);
}

// 5) 压缩
fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(outFile, { force: true });
execSync(`cd "${stageDir}" && zip -rq "${outFile}" .`, { stdio: "inherit" });
fs.rmSync(stageDir, { recursive: true, force: true });

const size = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`[kit] 完成：${path.relative(repoRoot, outFile)}（${size} KB）`);
