---
title: 用 OmniRoute 自建 AI 网关并开放局域网访问（踩坑实录）
date: 2026-10-04
tags: [AI, 教程, Next.js]
summary: Next.js 写的 AI 网关在 dev 模式下局域网访问会无限转圈，生产模式 + 三个配置项才是正解。完整过程与三个坑。
draft: true
---

[OmniRoute](https://github.com) 是一个开源的"免费 AI 网关"：聚合 358 个提供商的免费额度，对外提供 OpenAI 兼容 API，带 Dashboard。这篇文章记录我把它部署到本机、并开放给局域网其他电脑使用的完整过程，重点是三个坑。

## 部署主流程

```bash
git clone <omniroute> && cd OmniRoute
cp .env.example .env          # 生成 JWT_SECRET / API_KEY_SECRET
npm install
npm run build                 # 务必生产模式
PORT=20128 npm start
```

接入免注册 provider 通过 Dashboard 完成，然后就能用标准 OpenAI SDK 调用了：

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://10.1.74.64:20128/v1",
  apiKey: "sk-xxx", // 网关生成的 key
});

const res = await client.chat.completions.create({
  model: "auto", // 网关自动路由
  messages: [{ role: "user", content: "ping" }],
});
```

## 坑一：dev 模式下局域网访问无限转圈

现象：本机 `localhost:20128` 一切正常，局域网其他电脑打开页面——登录页能出，但点任何东西都转圈。

排查：浏览器 DevTools 看到大量 `/_next/hmr` 请求被 CORS 拦截。**根因是 Next.js dev 模式的热更新（HMR）WebSocket 只认 localhost**，即使 `.env` 里配了 `HOSTS` 白名单也不够。

解法：局域网使用必须走生产模式：

```bash
npm run build
PORT=20128 npm start
```

同时在 `next.config.mjs` 的 `allowedDevOrigins` 里加入本机局域网 IP 兜底（仅影响 dev 模式）。

## 坑二：npm 11 会静默跳过原生模块

构建报 `better-sqlite3` 相关错误。原因：npm 11 对带原生编译的依赖处理有变化，某些情况下 `npm install` 没有真正编译它。

解法：显式补装并看到编译日志：

```bash
npm install better-sqlite3 --no-save --foreground-scripts
```

`--foreground-scripts` 让 node-gyp 的输出直接打到终端，方便确认编译成功。

## 坑三：Windows 防火墙默认拦入站

局域网其他电脑连不上，但本机 telnet 正常——典型的 Windows 防火墙入站拦截。给两个端口开规则（限制来源网段，别全放）：

```powershell
New-NetFirewallRule -DisplayName "OmniRoute Dashboard" -Direction Inbound `
  -Protocol TCP -LocalPort 20128 -RemoteAddress 10.1.0.0/16 -Action Allow
```

- `20128`：Dashboard + API（需要开放）
- `20132`：Live WebSocket（需要开放）
- `20131`：仅本机使用的服务（不要开放）

## 效果

完成后，局域网里任何一台电脑都能：

- 打开 `http://10.1.74.64:20128/dashboard` 管理通道；
- 用 OpenAI 兼容客户端把 base URL 指到 `http://10.1.74.64:20128/v1`，模型填 `auto`，白嫖聚合额度。

## 两个小提醒

1. 局域网 IP 是 DHCP 分配的，一旦变了要同步更新 `.env` 白名单和防火墙规则——建议给这台机器配静态 IP 或 DHCP 保留。
2. `auto` 路由偶尔会先撞到某个免费层的限制返回 402/403，重发一次就会换通道；嫌烦可以在 Dashboard 停用不稳定的 provider。

整个过程中最值得记的一句话：**本机能跑 ≠ 局域网能用，dev 模式 ≠ 生产模式**。
