---
title: 穷鬼套餐 02：303 个文件，4.6 秒 0 元上线
date: 2026-10-20
tags: [独立开发, Cloudflare, 部署, 穷鬼套餐, AI]
draft: false
summary: 写完的东西往哪放？Cloudflare Pages 两条部署路：Git 连接和 wrangler 直传。创建项目前就要选对，因为官方明说了不能互转。这篇用我自己博客的真实部署数据，把两条路一次讲透，附免费额度账本和踩坑清单。
x_hooks: [穷鬼套餐 02：两条路把静态站送上全球 CDN，一分钱不花]
column: infra
series: cf-free
seriesOrder: 2
---

上一篇[穷鬼套餐开篇](/blog/cloudflare-free-series-01-map)发出去之后，公众号后台收到最多的一个问题不是"免费额度够不够"，而是：**我写完了，到底怎么放上去？**

好，这就是系列第二篇的活。这篇我用自己的博客实测了一遍：从命令敲下去到全球可访问，上传 303 个文件只花了 4.57 秒，全程费用 0 元。部署这件事，值得被讲得简单一点。

> 声明：本系列与 Cloudflare 官方无任何关系，属于个人经验分享。文中额度均标注核验日期（2026-10），以[官方文档](https://developers.cloudflare.com/pages/platform/limits/)为准。

## 先选路：两条路，创建前就要想清楚

Pages 上线一个静态站，只有两条路：

| | Git 集成 | Direct Upload（直传） |
|---|---|---|
| 怎么工作 | 连接 GitHub/GitLab，push 代码自动构建部署 | 本地构建好，把产物文件夹传上去 |
| 上传方式 | 网页上点几下一步骤完成 | wrangler 命令行，或网页拖拽 |
| 适合谁 | 持续更新的正式项目 | 本地写完的小工具、AI 生成的项目、想自己控制构建的场景 |
| 自动化 | push 即部署，全程无感 | 可以接进任何 CI，也可以让 AI Agent 替你执行 |

这里有一个**官方文档白纸黑字写的坑，我放在最前面**：两种方式创建项目之后**不能互相转换**。Git 集成的项目不能改成拖拽部署，直传的项目不能改成 push 自动部署——想换，只能删掉重建。[官方原文](https://developers.cloudflare.com/pages/get-started/direct-upload/)写的是 "You cannot switch to Git integration later"。

所以创建项目前先问自己一个问题：这个项目以后会持续更新吗？会，走 Git 集成；一次性或本地构建，走直传。想不清楚就走 Git 集成——毕竟 wrangler 也能手动部署 Git 集成的项目，反过来不行。

（顺带一提，直传里的"拖拽上传"和"wrangler 命令行"是可以混用的，都算直传项目。）

## 路线 A：Git 集成，五步点上线

这是最省心的路，适合所有正经项目。全程在网页上完成：

1. 打开 Cloudflare 控制台 → **Workers & Pages** → **Create**，选 **Continue with GitHub**（旧版入口走页面底部的「继续前往 Pages」）；
2. 授权 GitHub 或 GitLab，选中你的仓库（私有仓也支持）；
3. 配置构建参数（下面细说）；
4. 点 **Save and Deploy**，看它当场装依赖、跑构建；
5. 完成后拿到一个 `xxx.pages.dev` 的网址，全球可访问。

第三步的构建参数只有三个字段值得说：

- **Framework preset（框架预设）**：选了框架它会自动帮你填好另外两项。不确定就选 None 手动填。
- **Build command（构建命令）**：你的框架怎么打包就填什么，比如 Next.js 静态导出是 `npx @cloudflare/next-on-pages`，纯静态页留空。
- **Build output directory（输出目录）**：构建产物在哪个文件夹，比如 `out`、`dist`、`public`。**这个字段配错是新手报错第一名**——提示找不到输出目录，八成是路径写错了。

两个进阶配置记一下：

- **Root directory**：monorepo 必设。仓库根目录下有好几个项目时，告诉 Pages 你的站点在哪个子文件夹，否则它在仓库根目录装依赖，必炸。
- **环境变量 `NODE_VERSION`**：构建机的 Node 版本和本地不一致时，构建会以很玄学的方式失败。在项目 Settings → Environment variables 里显式设一个 `NODE_VERSION`（比如 `22`），一劳永逸。

配好之后，你的日常就是 `git push`，剩下的它全包。其他分支的 push 还会自动生成预览部署（`<branch>.<project>.pages.dev`），写博客改版可以先看效果再合并。

## 路线 B：wrangler 直传，一条命令上全球 CDN

如果你是本地构建，或者——说实话这是 2026 年更常见的场景——**项目是 AI 帮你写的，你只想要"能上线"这一个结果**，直传更适合。

三条命令，前提是本地先 build 出产物文件夹：

```bash
npx wrangler login                        # 第一次用需要授权，会弹浏览器
npx wrangler pages project create         # 创建项目，起个名字，选生产分支
npx wrangler pages deploy <输出目录>       # 把产物传上去，完事
```

这不是纸上教程。写这篇文章的时候，我刚用这条命令部署了我自己的博客（Next.js 静态导出，342 个文件的真实项目），完整输出如下：

![实测：wrangler pages deploy 真实输出，303 个文件 4.57 秒传完](https://pic.itzhouq.cn/cfs02-20261020-wrangler-deploy.png)

303 个新文件上传 + 全球边缘网络部署，一共 4.57 秒。没有服务器，没有 nginx，没有证书，没有备案——因为 `.pages.dev` 本身就是 HTTPS。

部署之后想看账号下所有项目，一条命令：

```bash
npx wrangler pages project list
```

![实测：wrangler pages project list 输出，Git Provider 列可见两种项目的区别](https://pic.itzhouq.cn/cfs02-20261020-project-list.png)

看这张真实输出的 **Git Provider** 列：`Yes` 的是 Git 集成项目（我的游戏攻略站们），`No` 的是直传项目（博客和工具箱）。我自己的用法就是按前面说的原则分的：要长期更新的走 Git，工具和实验品走 wrangler。

另外，直传项目想回滚或看历史，`npx wrangler pages deployment list` 可以列出所有部署的预览地址；网页控制台上也有完整的部署历史可以一键回滚。

## 免费额度账本（核验于 2026-10）

把数字摆出来，你自己判断够不够用：

| 项目 | 免费额度 | 人话 |
|---|---|---|
| 构建次数 | 500 次/月 | 每天可以 push 十几次，个人项目用不完 |
| 单次构建时长 | 20 分钟 | 静态站构建普遍 1-3 分钟 |
| 并发构建 | 1 个 | 一次 push 一个，排队但没人跟你抢 |
| 站点文件数 | 20,000 个/站 | 博客、文档站、中小工具站都够 |
| 单文件大小 | 25 MiB | 大视频大安装包别放这，去 R2（系列后面会写） |
| 项目数 | 100 个/账号 | 足够你开一百个站 |
| **静态请求和带宽** | **不限** | 这才是重点：流量再大也不收钱 |

最后一行加粗是有原因的。传统虚拟机方案里，带宽是成本大头；Pages 把静态资源请求和带宽做成不限量，意味着你的站被任何程度的流量打爆（哪怕是好消息式的爆），账单都是 0。

## 踩坑清单，都是真金白银换来的

1. **Git 集成和直传不能互转**——前面说过了，再说一遍因为它值得。创建前选好。
2. **输出目录写错**：`dist` 和 `build`、`out` 和 `.output`，各框架叫法不一，报 "Output directory not found" 先查这个。
3. **monorepo 忘设 Root directory**：Pages 默认从仓库根目录开始构建，monorepo 用户必踩。构建设置里的 Advanced 里改。
4. **构建机 Node 版本和本地不一致**：本地好好的，云端构建报一堆看不懂的错。设 `NODE_VERSION` 环境变量解决。
5. **拖拽上传不支持 Pages Functions**：拖拽方式部署的项目不会编译 `functions/` 目录，想让 Pages 带后端函数就得用 wrangler 部署。（`_worker.js` 高级模式倒是拖拽也支持。）
6. **超过 25 MiB 的文件**：上传直接被拒。这不是缺陷是分工——大文件去 R2，出口流量还免费，这个系列后面有专门一篇。

## 一个诚实的提醒：Pages 正在向 Workers 演进

调研这篇的时候我特意去翻了官方迁移文档：Cloudflare 现在明确建议**新项目**用 Workers（带静态资源部署），Pages 的一些新特性（Vite 插件、灰度发布、更完善的日志等）只在 Workers 侧提供，命令从 `wrangler pages deploy` 变成 `wrangler deploy`，核心概念一一对应，迁移指南很完整。

那这个系列为什么还讲 Pages？因为对"今天就想把一个静态站上线"的人来说，Pages 的网页化流程仍然是门槛最低的路径，而且存量功能完全可用、没有停止维护的公告。但你需要知道风向：系列第十篇复盘时我会专门对比两条演进路线，到时候你手里已经有了一个跑起来的站，再迁也不迟。

## 写在最后

五年前部署一个网站：买服务器、装环境、配 nginx、申请证书、开端口、防攻击，然后每个月交钱，每一次发版都手心冒汗。

现在：`npx wrangler pages deploy out`，4.57 秒，0 元，全球 CDN。

这不是什么高深技术，就是把"部署"还原成它本来的样子——把文件放到网上。如果你手上正好有个写完没上线的项目，今晚就可以动手，两条路选一条，五分钟之内它会出现在全球任何一台设备上。

下一篇我们继续往架构深处走一步：光有静态页不够，很多功能需要一个后端——Workers 上写第一个 API，几十行代码能解决多少事，见。

有任何问题可以在评论区聊（giscus 已开通），也欢迎在 [GitHub](https://github.com/itzhouq) 关注我的开源项目。

## 相关链接

- 系列上一篇：[不买服务器的独立开发者：开一个「穷鬼套餐」系列](/blog/cloudflare-free-series-01-map)
- 我的工具箱（本次实测项目之一）：[tools.itzhouq.cn](https://tools.itzhouq.cn)
- Cloudflare Pages 官方文档：[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) / [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) / [Limits](https://developers.cloudflare.com/pages/platform/limits/)

这篇首发于我的博客 [itzhouq.cn](https://itzhouq.cn)，公众号同步连载。

## 关于作者

我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

这是穷鬼套餐系列第二篇（部署），后续实操全部在我博客 itzhouq.cn 与公众号同步连载。想交流 AI 搞副业、白嫖部署——**关注公众号「搞副业的老周itzhouq」，回复「微信」加我**，第一时间同步新文章和翻车现场。
