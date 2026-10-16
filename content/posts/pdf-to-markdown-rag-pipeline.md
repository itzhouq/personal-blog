---
title: PDF 转 Markdown 搜索量 12 个月涨了 2.6 倍，前十名却一个独立站都没有
date: 2026-10-16
tags: [独立开发, BuildInPublic, SEO, RAG, Markdown, AI Agent]
summary: 为了给 RAG 喂语料，我研究了 300 个「文档转 Markdown」相关关键词，发现整个品类搜索量 12 个月涨了 2.6 倍、llm document parsing 这个新词暴涨 6 倍，而 Google 前十名里几乎没有一个独立站。这篇完整公开调研数据、选型对比和一个积分制订阅站从 0 到上线收款的全过程。
x_hooks: ["给 RAG 喂语料第 3 天，我放弃了手写解析管线", "一个 10 年后端程序员，用 AI Agent 做了个 PDF 转 Markdown 订阅站"]
---

做 RAG 的人应该都踩过这个坑：PDF 丢进去，出来的东西不能看。

表格变成一长串制表符，扫描件直接是空白，公式和代码块全军覆没，两栏排版的论文被读成了左右栏交错的神奇顺序。你精心搭的向量数据库，喂进去的全是垃圾。

我自己踩了大概半年。直到 10 月初，我决定认真解决这件事——不是再写一个脚本，而是把它做成一个能收钱的产品。

这篇文章公开全部过程：调研数据、选型对比、踩坑清单，以及一个反常识的发现。

## 动手之前，我先研究了 300 个关键词

按惯例，先看需求再动手。我用 wordscout 跑了「pdf to markdown」相关的 300 多个词，精评了其中 12 个。结论比我预期的激进得多。

**第一，整个品类在暴涨。**

| 词 | 近 12 月 | 前 12 月 | 变化 |
|---|---|---|---|
| pdf to markdown | 55.7 | 21.8 | **📈 2.6x** |
| pdf to markdown converter | 61.7 | 22.8 | **📈 2.7x** |
| document to markdown | 52.2 | 21.9 | **📈 2.4x** |
| **llm document parsing** | 43.2 | 7.2 | **📈 6.0x** |

注意最后一行：`llm document parsing` 是个 **15 个月大的新词**，搜索量翻了 6 倍。翻译一下这个信号——LLM/RAG 热潮把「文档转 Markdown」这个 20 年的老品类整体拉起来了，而且拉出了一批全新的搜索意图。

**第二，前十名几乎全是巨头内页，独立站首页接近 0。**

精评的 12 个词里，头部全是 pdf24、smallpdf、ilovepdf、Adobe 的内页和平台页。像 `pdf to markdown api`（KD 21）这种商业意图明确的词，前十名独立站首页是 **0**。同时盘面里 7-22 个月的新域名大量进榜（file2markdown.ai、md-to.com、rawmark.tech、mdspin.app）——Google 正在给新站机会。

**第三，难度全在个人可承受区。**核心词 KD 7-27，外链预算 13-38。对我这种一个人、没预算、没团队的副业项目，这是少见的「能打」的盘面。

三个信号叠在一起：需求爆发 + 新词窗口 + 巨头看不上的长尾。我判断这事能干，给它起了个名字：**MarkdFlow**（markd + flow，文档处理管道），域名 markdflow.org。

## 选型：手写管线、markitdown，还是站在巨人肩膀上

需求明确了，下一步是技术路线。我认真对比过三条路。

**路线一：自己手写解析管线。**PDF 解析是个深坑——版面分析、表格还原、OCR、阅读顺序，每一项都是论文章节。我花了三天评估，放弃了：副业项目里时间是最贵的资源，手写管线至少要两三周，还不一定能达到商用质量。

**路线二：微软的 markitdown。**开源、MIT、Python 一行命令。我测了，常规 PDF 确实能转。但两个硬伤：扫描件要走 OCR 它不管，复杂表格还原度看运气，而且它是个命令行工具——没有用户系统、没有计费、没有 API，离「能收钱的产品」差着一整个 SaaS。

**路线三：fork 一个开源全栈项目，换品牌、接支付、修坑。**GitHub 上有个 Open-FileMarkd（MIT 协议），Next.js + 用户系统 + Stripe 支付 + 多语言都做好了，底层调 Mistral 的 OCR API。fork 过来，换支付通道、换视觉、修上游的坑——5 天能上线。

这个账很好算：**能站在巨人肩膀上，就不自己造肩膀。**MIT 允许商用和闭源衍生，法律干净，唯一义务是保留版权声明。

当然，fork 不是白捡的。上游代码有一半的坑「看起来能跑」——本地开发环境好好的，一上生产就炸。这部分后面细说。

## 产品设计：三个和别人不一样的决定

**决定一：每一块都带置信度分数。**

转出来的 Markdown，哪个段落是 OCR 高置信度的、哪个是模型猜的，全部标注。做 RAG 的人最怕的不是错，是不知道自己错了——按分数过滤低置信块，比全文信任或全文不信都靠谱。这个设计直接来自我自己喂垃圾语料的痛苦。

**决定二：按页计费，1 积分 = 1 页。**

不按次、不按文件、不搞「会员无限用」——一页就是一页的钱，用户自己能算清账。注册送 30 积分，够验证质量；批量需求买积分包（$5 起，永不过期）或订阅。积分只在转换成功时扣，失败不扣。

**决定三：API 是付费专属。**

开发者最想要的是 API——脚本里批量转 500 个 PDF。但免费账号不给 API Key，必须订阅（Trial $2.99 起）。逻辑很简单：免费额度是让用户在网页端验证质量的，不是给脚本白嫖 OCR 成本的。订阅到期，已发出的 Key 立即失效。

这三个决定背后是同一个思路：**这是个工具站，不是流量站。**每一个设计都对「愿意付钱的人」友好。

## SEO 落地：6 个词簇页，而不是 6 篇文章

上线只是第一步，让人搜到才是。按调研报告的词簇结构，我一口气铺了 6 个落地页：

| 页面 | 目标词 | KD |
|---|---|---|
| [/pdf-to-markdown](https://markdflow.org/pdf-to-markdown) | best pdf to markdown converter | 20 |
| [/ai](https://markdflow.org/ai) | best pdf to markdown converter **for ai** | **8**（新词） |
| [/llm-parsing](https://markdflow.org/llm-parsing) | **llm document parsing** | 27（6 倍涨） |
| [/pdf-to-markdown-api](https://markdflow.org/pdf-to-markdown-api) | pdf to markdown api | 21 |
| [/markitdown-alternative](https://markdflow.org/markitdown-alternative) | markitdown alternative | 16 |
| [/pdf-to-text](https://markdflow.org/pdf-to-text) | free pdf to text converter | 7-11 |

做法是「品牌域名 + 品类词路径」：markdflow.org 保持品牌属性，路径带精确匹配。竞品全是 file2markdown.ai 这种关键词堆叠域名——吃 EDM 红利，但难品牌化。我要的是后者：SEO 不吃亏，个人 IP 能长期沉淀。

10 月 13 号，6 个页面全部提交了 GSC 请求索引。10 月 16 号复查：**6 页全部已收录**，其中 `/ai` 和 `/llm-parsing` 这两个最优先的新词页都在内。站点累计数据：4 次曝光、0 点击、平均排名第 7——数字很小，但这是个 5 天前才提交的新站，先让 Google 认识我们。

## 踩坑清单：三个值钱的教训

**坑一：一次性产品的 webhook，没有「订阅」对象。**支付流程跑通后，Trial 购买（$2.99 一次性产品）的钱到了 Creem，用户权益却没到账。排查发现：我的 webhook 处理器只处理带 subscription 对象的事件，而一次性产品的支付回调里根本没有这个字段——钱收了，权益代码压根没被触发。这类 bug 的特点就是「主流程看起来全绿，只有一条边路是断的」。最后用真实测试卡跑了两轮完整支付（订阅 + 积分包）才确认修好。

**坑二：色相替换是换肤的正确答案。**上游的视觉指纹是紫粉渐变，我要换成完全不同的主色。没有逐文件改样式，而是写脚本做全局色相区间映射——339 处颜色类、25 个 CSS 变量、logo/favicon 一次跑完，构图和渐变关系原样保留。**换皮的核心是映射，不是重画。**

**坑三：别人网站的「小零件」可能比你的功能还顽固。**右下角那个 Netlify 徽标，重定向规则拦不住（边缘注入的路径不吃站点重定向），最后靠一行 CSS `#nl-badge-frame{display:none}` 解决。这种事不大，但用户每次截图都会看到——品牌是细节的积分。

## 现在的数据和接下来的路

公开一下现状：产品上线 5 天，6 个 SEO 页面全部被 Google 收录，支付链路（订阅 + 积分 + 退款）全链路验证通过，Creem 的身份审核进行中。

接下来三件事：每月跑一次 wordscout 复查关键词趋势（尤其盯 `llm document parsing` 的 6 倍涨能不能延续）；把产品注册成 public 仓库前把 README 重写成英文；写更多 RAG 语料方向的内容，把 6 个落地页的流量接住。

工具站是这个时代少见的「需求明确、竞争可见、个人可及」的生意。巨头看不上的长尾，就是独立开发者的口粮。

---

**相关链接**：

- 前篇：[上个站 56 天零收入，这个站 5 天收到第一笔钱](/blog/voicewove-fork-to-live)
- MarkdFlow 落地页：[PDF to Markdown](https://markdflow.org/pdf-to-markdown) · [For AI & RAG](https://markdflow.org/ai) · [LLM Document Parsing](https://markdflow.org/llm-parsing) · [Conversion API](https://markdflow.org/pdf-to-markdown-api) · [MarkItDown Alternative](https://markdflow.org/markitdown-alternative) · [PDF to Text](https://markdflow.org/pdf-to-text)

这篇首发于我的博客。

**关于作者**：我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

关注公众号「搞副业的老周itzhouq」，回复「微信」加我，第一时间同步新文章和翻车现场。
