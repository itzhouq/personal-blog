---
title: 给 RAG 喂语料的第 3 天，我把它做成了按页收费的产品
date: 2026-10-17
draft: true
tags: [独立开发, BuildInPublic, RAG, Markdown, AI Agent]
summary: 做 RAG 的都知道，PDF 喂进向量库基本等于喂垃圾。而 Markdown 恰好是 AI 模型原生支持的格式——通用、轻量、结构保留。于是我把「文档转 Markdown」做成了一个按页计费的小工具，5 天上线，6 天被 Google 全量收录。过程比想象中顺利，也比想象中值得记录。
x_hooks: ["PDF 转 Markdown 按页收费，我把这个「巨头看不上」的需求做成了产品", "又给 AI 喂了一个月垃圾语料后，我花了 5 天做了个转换站"]
---

做 RAG 的人应该都踩过这个坑：PDF 丢进向量库，出来的是乱掉的表格、空白的扫描件和错乱的阅读顺序。你精心调的检索策略，喂进去的全是垃圾。

我踩了半年，终于忍无可忍。

## 为什么是 Markdown

做 AI 应用，Markdown 几乎是文档的「标准答案」：

- **主流模型原生支持**——GPT、Claude、Gemini 都在 Markdown 上训练，标题、列表、代码块的结构信息能被完整理解；
- **对 token 友好**——同样一页文档，Markdown 比 PDF 原始文本省得多，还没有乱码噪音；
- **通用性拉满**——Obsidian、Notion、GitHub、博客，全都能直接吃。

问题只在于：把 PDF、扫描件、Word 变成干净的 Markdown，这一步很难做好。市面上的转换工具要么转出来不能看，要么免费额度少得像施舍。

## 所以我做了一个

5 天，上线了 **[MarkdFlow](https://markdflow.org)**：

![MarkdFlow：AI 驱动的文档转 Markdown 工具](https://pic.itzhouq.cn/20261017163603513.png)

上传 PDF、扫描件或 Office 文档，AI 转出干净的 Markdown，**每个内容块都带置信度评分**——做 RAG 的可以按分数过滤，不把垃圾喂进向量库。

计费按页：1 积分 = 1 页，转换失败不扣钱；注册送 30 积分，够先验证质量再决定付不付费。订阅或积分包都行，付费用户带 API。

上线 6 天的进展：6 个落地页被 Google 全量收录，支付到账、退款回收这些真金白银的链路，都用真实支付在环境里跑通过了一遍。

## 接下来

这种「巨头看不上」的长尾需求，就是独立开发者的口粮。工具已经就位，接下来就是等风来——每月复查关键词趋势，持续写内容，等第一个不用我催的真实付费用户。

---

**相关链接**：

- 前篇：[上个站 56 天零收入，这个站 5 天收到第一笔钱](/blog/voicewove-fork-to-live)
- MarkdFlow：[PDF to Markdown](https://markdflow.org/pdf-to-markdown) · [For AI & RAG](https://markdflow.org/ai) · [LLM Document Parsing](https://markdflow.org/llm-parsing) · [Conversion API](https://markdflow.org/pdf-to-markdown-api) · [MarkItDown Alternative](https://markdflow.org/markitdown-alternative) · [PDF to Text](https://markdflow.org/pdf-to-text)

这篇首发于我的博客。

**关于作者**：我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

关注公众号「搞副业的老周itzhouq」，回复「微信」加我，第一时间同步新文章和翻车现场。
