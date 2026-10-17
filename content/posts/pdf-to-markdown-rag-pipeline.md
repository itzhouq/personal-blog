---
title: PDF 转 Markdown 搜索量 12 个月涨了 2.6 倍，前十名却一个独立站都没有
date: 2026-10-17
draft: true
tags: [独立开发, BuildInPublic, RAG, Markdown, AI Agent]
summary: 为了给 RAG 喂干净语料，我研究了 300 个「文档转 Markdown」相关关键词，发现整个品类搜索量 12 个月涨了 2.6 倍，而 Google 前十名里几乎没有一个独立站。于是我花了 5 天做了一个按页计费的转换工具，上线 6 天被 Google 全量收录。这篇把调研数据和过程全部公开。
x_hooks: ["给 RAG 喂语料第 3 天，我决定把它做成一个产品", "一个 10 年后端程序员的新副业：PDF 转 Markdown，按页收费"]
---

做 RAG 的人应该都踩过这个坑：PDF 丢进向量库，出来的是乱掉的表格、空白的扫描件和错乱的阅读顺序。你精心搭的检索系统，喂进去的全是垃圾。

我踩了半年。这次决定认真解决——顺便验证一个想法：这种「巨头看不上」的需求，能不能做成一个人的小生意？

## 先看数据，再动手

我用关键词工具研究了 300 多个「文档转 Markdown」相关词，三个发现：

| 词 | 近 12 月 | 前 12 月 | 变化 |
|---|---|---|---|
| pdf to markdown | 55.7 | 21.8 | **📈 2.6x** |
| pdf to markdown converter | 61.7 | 22.8 | **📈 2.7x** |
| **llm document parsing** | 43.2 | 7.2 | **📈 6.0x** |

1. **整个品类在暴涨**——LLM 和 RAG 热潮把一个 20 年的老需求整体拉了起来，还拉出了 `llm document parsing` 这种 15 个月大、涨了 6 倍的新词。
2. **前十名几乎全是巨头内页**（pdf24、smallpdf、Adobe），独立站首页接近 0。
3. **难度在个人可承受区**：核心词难度 7-27，盘面里 7-22 个月的新域名大量进榜——Google 正在给新站机会。

需求爆发 + 新词窗口 + 巨头不看好的长尾。我判断这事能干。

## 做了什么

5 天，上线了 **[MarkdFlow](https://markdflow.org)**：上传 PDF、扫描件或 Office 文档，AI 转出干净的 Markdown，**每个内容块都带置信度评分**——做 RAG 的可以按分数过滤，不把垃圾喂进向量库。

计费按页：1 积分 = 1 页，转换失败不扣钱；注册送 30 积分，够先验证质量。订阅或积分包都行，付费用户带 API。

上线 6 天的进展：**6 个 SEO 页面全部被 Google 收录**，支付全链路（支付、到账、退款）在真实环境验证通过。第一天就有朋友付了 $2.99 又退款测试——这 $2.99 的往返，比任何内部测试都有说服力。

## 一个教训

最大的坑不是代码，是「模板残留」：产品基于开源项目改造，换品牌时漏改了几处上游文案——连定价页展示的价格都是模板里的旧数字。这种东西用户不一定说，但一定会影响信任。**上线前值得做一次「全页面逐字过一遍」的笨功夫。**

## 接下来

每月复查关键词趋势，写更多 RAG 语料方向的内容，等第一个真实付费用户。

工具站是这个时代少见的「需求明确、竞争可见、个人可及」的生意。巨头看不上的长尾，就是独立开发者的口粮。

---

**相关链接**：

- 前篇：[上个站 56 天零收入，这个站 5 天收到第一笔钱](/blog/voicewove-fork-to-live)
- MarkdFlow：[PDF to Markdown](https://markdflow.org/pdf-to-markdown) · [For AI & RAG](https://markdflow.org/ai) · [LLM Document Parsing](https://markdflow.org/llm-parsing) · [Conversion API](https://markdflow.org/pdf-to-markdown-api) · [MarkItDown Alternative](https://markdflow.org/markitdown-alternative) · [PDF to Text](https://markdflow.org/pdf-to-text)

这篇首发于我的博客。

**关于作者**：我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

关注公众号「搞副业的老周itzhouq」，回复「微信」加我，第一时间同步新文章和翻车现场。
