---
title: 从零手写一个 Next.js 博客（本站的技术栈与实现）
date: 2026-10-03
tags: [Next.js, 建站]
summary: 不用模板，从空目录开始手写：Markdown 管线、深浅色主题、RSS/SEO、搜索。本站就是用它搭的，这篇是自曝实现细节。
---

你现在看到的这个博客，是我从空目录开始手写的——没有用任何现成博客模板。这篇文章公开全部实现细节，也算给自己留一份"为什么这么设计"的备忘。

## 技术选型

- **Next.js 16 + React 19 + TypeScript**：生态成熟，SEO 开箱即用，以后加小工具/商城都是同一个框架；
- **Tailwind CSS v4**：原子类 + CSS 变量做主题，深浅色切换只需一个 `dark` class；
- **unified/remark/rehype** 管线渲染 Markdown，**不引入 MDX、不引入 CMS**——内容就是 `content/posts/*.md`，git 即后台。

依赖刻意保持在个位数，博客的核心是**内容和排版**，不是技术堆砌。

## Markdown 管线

一篇文章从 `.md` 到 HTML 的流水线：

```ts
const processor = unified()
  .use(remarkParse)              // 解析为 AST
  .use(remarkGfm)                // 表格/任务列表/删除线
  .use(remarkRehype)             // 转 HTML 树
  .use(rehypeSlug)               // 标题加 id
  .use(rehypeAutolinkHeadings)   // 标题可点击锚点
  .use(rehypeHighlight)          // 代码高亮
  .use(rehypeStringify);         // 输出 HTML 字符串
```

有个细节：文章页右侧的目录（TOC）需要标题的 id。我单独用 `remark-parse` 遍历 AST 提取 h2/h3，再用 `github-slugger` 生成 slug——它和 `rehype-slug` 内部用的是同一个库，保证目录锚点能对上。

## 内容层

frontmatter 用 `gray-matter` 解析，字段极简：

```yaml
---
title: 文章标题
date: 2026-10-03
tags: [Next.js, 建站]
summary: 一句话摘要，会出现在列表页和 SEO 描述里
---
```

`draft: true` 的文章在开发模式可见、生产构建自动剔除，方便写一半的东西先躺仓库里。中文阅读时长按 CJK 字符数（380 字/分钟）+ 英文词数（200 词/分钟）估算。

## 主题与配色

设计走"纸感编辑风"：米白纸底 + 墨色正文 + **朱砂红**做点缀色（链接 hover、选中高亮、标签）。所有颜色收敛为 6 个 CSS 变量，深色模式只是换了一组变量值：

```css
:root { --accent: #c73e3a; --bg: #faf8f5; /* ... */ }
.dark { --accent: #f08080; --bg: #0f0d0c; /* ... */ }
```

防闪白的关键是在 `<head>` 里塞一段同步脚本，首帧渲染前就把 `dark` class 挂到 `<html>` 上。

## 站点功能清单

这些全部是标准 Next.js 能力，没用第三方服务：

| 功能 | 实现 |
| --- | --- |
| RSS 全文输出 | `app/rss.xml/route.ts` 动态生成 |
| sitemap / robots.txt | `sitemap.ts` / `robots.ts` 约定文件 |
| 站内搜索 | 预生成 JSON 索引 + 纯前端过滤 |
| 代码复制按钮 | 客户端渐进增强，给每个 `pre` 注入按钮 |
| 评论 | giscus（GitHub Discussions），配置留空即隐藏 |
| 统计 | umami 自托管，同样配置驱动 |
| SEO | 每篇文章独立 `generateMetadata` + OG 标签 |

## 为什么不直接用模板

模板（比如 tailwind-nextjs-starter-blog）很好，但我想得到三样东西：

1. **对每一行代码的理解**——以后要做分发的、要挂工具的、要接支付的，都得自己改；
2. **恰好需要的功能**——没有后台、没有数据库、没有用户系统，也就没有攻击面；
3. **可迁移的判断力**——亲手写一遍 unifed 管线，下次遇到任何渲染需求都不虚。

全部代码就在这个仓库里，欢迎 fork 自用。下一篇我会写怎么在这套底座上挂第一个小工具。
