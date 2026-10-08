---
title: 给博客挂上第一个 AI 小工具
date: 2026-10-07
tags: [AI, Next.js, Build in Public]
summary: 从设计决策到上线只花了一个下午：BYOK 模式、流式输出、混合内容的坑——本站第一个工具「AI Chat 游乐场」的完整复盘。
---

上个月写[从零手写博客](/blog/build-blog-from-scratch)的时候留了个伏笔：内容站的尽头是"内容 → 工具 → 产品"。这个伏笔今天兑现了——本站第一个小工具 [AI Chat 游乐场](/tools/chat)上线，这篇文章复盘它的设计决策和踩坑。

## 为什么第一个工具是 Chat

选型时想过文档问答、文案助手，最后选了最"朴素"的对话：它是验证整条链路（页面 → 大模型 API → 流式渲染）最短路径的工具。后面所有工具——无论文案、问答还是智能体——底层都是这一条链路，先把水管铺通，以后接什么都方便。

## 关键决策：BYOK（Bring Your Own Key）

第一个要回答的问题：**API Key 从哪来？**

方案 A 是我在服务端放一个 Key 大家共用——但本站是纯静态站，没有服务端；要加就得引入后端和计费，违背"从零手写、无数据库"的初衷。

所以选了方案 B：**BYOK**——访客填自己的 OpenAI 兼容端点 + Key，浏览器直连。好处很直接：

- 零服务器成本，纯静态托管扛得住任意流量；
- Key 只存访客自己的 localStorage，不经过任何第三方（包括我）；
- 合规简单：没有代充值、没有账号体系。

代价是访问门槛：用户得有一个 API Key。对目标读者（折腾 AI 的开发者）来说，这门槛约等于零。

## 技术点一：流式输出

对话体验的生命线是流式。OpenAI 兼容接口的流式响应是 SSE 格式，浏览器端用 `fetch` + `ReadableStream` 手动解析：

```ts
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = "";
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  const lines = buf.split("\n");
  buf = lines.pop() || ""; // 半行留到下一轮
  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") continue;
    const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
    if (delta) appendToLastMessage(delta);
  }
}
```

三个细节：`buf.pop()` 处理跨 chunk 的半行；`[DONE]` 是结束标记；解析失败的行直接跳过（有的网关会夹带注释行）。另外做了降级：如果响应不是 `text/event-stream`，按普通 JSON 处理，兼容不支持流式的端点。

## 技术点二：混合内容的坑

上线前自测差点翻车：**HTTPS 页面调用 HTTP 接口会被浏览器直接拦截**（混合内容），报错还长得像 CORS，容易误诊。

规则记一下：

- `https://` 页面 → `http://` 接口：**拦截**；
- 例外只有 `localhost` / `127.0.0.1`（浏览器视为安全上下文）。

所以我在本机填 `http://localhost:.../v1`（本机自建服务）一切正常，局域网其他电脑填 `http://局域网IP:.../v1` 就会被拦。想让局域网机器也能连，得给服务套一层 HTTPS（Caddy 两行配置的事）。对公网访客则完全无感——主流模型服务商都是 HTTPS 端点。

## 技术点三：被"聪明"坑到的 details 组件

配置面板我用了原生 `<details>`，第一版偷懒写了 `open={!ready}`（没配好就展开）——结果填完 Key 的瞬间面板"啪"地自动收起，其他字段还没填完。受控组件会忠实执行你给的每个状态，哪怕这个状态并不符合用户意图。改成用户手动控制展开收起，问题消失。

**教训：UI 的"自动化体贴"要克制，用户操作到一半的界面不要自作主张。**

## 效果

- 页面：[itzhouq.cn/tools/chat](/tools/chat)，支持流式输出、多轮对话、系统提示词、Ctrl+Enter 发送、停止生成；
- 配置持久化在 localStorage，第二次打开即用；
- 全部代码在本仓库 `app/tools/chat/`，共一个页面文件，没有新增任何依赖。

## 下一步

路线图更新：工具矩阵的管子通了。接下来会继续挂更多小工具，并公开它们的数据。
