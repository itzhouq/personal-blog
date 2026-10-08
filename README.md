# personal-blog

从零手写的个人博客——Next.js 16 + React 19 + Tailwind CSS v4，无模板、无 CMS、无数据库，内容就是 `content/` 里的 Markdown 文件。

![tech](https://img.shields.io/badge/Next.js-16-black) ![tech](https://img.shields.io/badge/React-19-blue) ![tech](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![tech](https://img.shields.io/badge/TypeScript-5-3178c6)

## 快速开始

```bash
npm install
npm run dev        # 开发模式 http://localhost:3000（草稿可见）

npm run build      # 生产构建
npm start          # 生产模式
```

## 功能

- 📝 Markdown 文章（GFM 表格/任务列表）+ frontmatter（title/date/tags/summary/draft）
- 📑 文章目录（TOC）、代码高亮、复制按钮、上一篇/下一篇、阅读时长
- 🌗 深浅色主题（跟随系统 + 手动切换，localStorage 记忆，无闪白）
- 🔍 站内搜索（纯前端过滤，零依赖服务）
- 📡 RSS 全文输出、sitemap、robots.txt、每篇文章独立 SEO/OG 元数据
- 💬 giscus 评论、umami 统计——配置留空即自动隐藏
- 🧰 `/tools` 页面：预留给自己的小工具与服务入口
- 🚀 23 个页面全静态预渲染（SSG），可部署到任何 Node 环境

## 目录结构

```
├── site.config.ts        # ★ 站点配置：站名/作者/链接/导航/工具卡/评论/统计
├── content/
│   ├── about.md          # 关于页内容
│   └── posts/            # 文章目录，一个 .md 一篇
├── lib/                  # 文章解析、Markdown 管线、工具函数
├── components/           # Header/Footer/TOC/主题切换/评论/复制按钮…
└── app/                  # 路由：首页/文章/标签/工具/关于/搜索/RSS/sitemap
```

## 写一篇新文章

在 `content/posts/` 新建 `my-post.md`（文件名即 URL slug，建议英文）：

```markdown
---
title: 文章标题
date: 2026-10-06
tags: [标签1, 标签2]
summary: 一句话摘要（列表页和 SEO 描述用）
---

正文支持 GFM 表格、代码块（自动高亮 + 复制按钮）。

## 二级标题会自动进入右侧目录

草稿：加 draft: true，生产构建自动剔除，dev 模式可见。
```

## 个性化（上线前 checklist）

1. **`site.config.ts`**：改 `name / author / description / siteUrl / email / social`，调整导航和"正在构建"路线图、工具卡片；
2. **`content/about.md`**：写自己的介绍；
3. **评论**（可选）：GitHub 上建一个公开仓库开启 Discussions，去 [giscus.app](https://giscus.app) 生成四个 id，填入 `site.giscus`；
4. **统计**（可选）：自托管 [umami](https://github.com/umami-software/umami)，把脚本地址和 website id 填入 `site.analytics`；
5. **域名**：`siteUrl` 必须改成真实域名，否则 RSS/sitemap/OG 链接是错的。

## 部署

当前托管在 **Cloudflare Pages**（纯静态导出模式）：

```bash
npm run deploy   # = next build + wrangler pages deploy out
```

- 线上地址：https://personal-blog-302.pages.dev
- 首次部署前需 `npx wrangler login` 授权 Cloudflare；
- 也可接 GitHub 集成自动部署：Cloudflare Dashboard → Workers & Pages → personal-blog → 连接本仓库（构建命令 `npm run build`，输出目录 `out`）；
- 绑自定义域名：Pages 项目 → Custom domains。

其他方式：

```bash
npm start                     # VPS 直接跑 Node（配合 nginx/caddy 反代）
# Vercel：导入仓库即可（去掉 next.config.ts 的 output: "export"）
```

- **Vercel / Cloudflare Pages Git 集成**：连仓库零配置部署（国内访问速度自测，CF Pages 通常更稳）；
- 局域网自用：`npm start` 后放行防火墙端口即可（生产模式无 dev 模式的跨域问题）。

## 变现预留位（Roadmap）

- `/tools`：小工具入口（同仓库加路由即可）
- 首页"正在构建"：build in public 进度展示
- 后续：返利链接位、Newsletter
