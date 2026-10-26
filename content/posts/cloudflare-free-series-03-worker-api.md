---
title: 穷鬼套餐 03：32 行代码，10 万次调用，0 元
date: 2026-10-21
tags: [独立开发, Cloudflare, Workers, 穷鬼套餐, AI]
draft: false
summary: 网站上线后你会遇到三件事：前端调第三方接口被 CORS 拦、想要个全站计数、想每天自动抓点数据。这篇用一个 32 行的 Cloudflare Worker 把三件事一次解决——从建文件夹到本地实测，每一步都有真实输出。
x_hooks: [穷鬼套餐 03：不用买服务器，你的第一个 API 今天就能上线]
column: infra
series: cf-free
seriesOrder: 3
---

[上一篇](https://itzhouq.cn/blog/cloudflare-free-series-02-deploy)我们把静态站送上了全球 CDN。但网站跑起来之后，你迟早会遇到这三件事——都是我自己真实遇到过的：

1. **工具箱里的工具想加个计数**。我的[工具箱](https://tools.itzhouq.cn)里每个工具都显示"已被使用 N 次"，前端只能存 localStorage——每个用户看到的都只有自己的数据。想知道全站今天总共被用了多少次，必须有一个公共的记账员。
2. **前端调第三方接口被拦**。浏览器有个安全策略叫 CORS：你的网页用 JS 去请求别人的接口，对方没明确许可就会被浏览器拦截。解法是找一个中间人替你去请求。
3. **想让某些事每天自动发生**。我在做的 [macopenclaw.com](https://macopenclaw.com)（AI 开源自托管教程站，也是我的新词实验田）需要每天早上自动抓一次 AI 圈的新热词，总不能每天手动跑。

这三件事的共性：需要**一段公共的、一直在线的代码**。这就是"后端"。

传统做法是买台服务器。但为了三个小需求买服务器，就像为了收三个快递租个仓库。这篇讲 **Cloudflare Workers**：免费 10 万次请求/天，32 行代码把三件事一次解决。

> 声明：本系列与 Cloudflare 官方无任何关系。额度核验于 2026-10-21，以[官方定价页](https://developers.cloudflare.com/workers/platform/pricing/)为准；本篇所有代码和输出都是我在这台 Mac 上真实执行的结果。

## Workers 是什么

一句话：你写一个 JS 函数传上去，Cloudflare 把它复制到全球三百多个数据中心，谁请求就在谁旁边执行。没有机器要买，没有进程要守，没人请求就一分钱不花。

免费额度（核验于 2026-10-21）：

| 项目 | 免费额度 | 人话 |
|---|---|---|
| 请求数 | 100,000 次/天 | 每天十万次，个人项目用不完 |
| CPU 时间 | 10ms/次 | 只算代码运算时间，等接口返回的时间不算 |
| 超额后 | 当类操作报错 | 撑爆了也只是当天报错，**不会扣钱** |

## 第一步：建项目，就两个文件

随便找个地方建个文件夹，比如 `cf-demo`，里面放两个文件。

**文件一：`wrangler.jsonc`**（配置文件，告诉 Cloudflare 这是什么）：

```jsonc
{
  "name": "cf-demo",
  "main": "index.js",
  "compatibility_date": "2026-10-08",
  "triggers": { "crons": ["*/5 * * * *"] }
}
```

- `name`：项目名，上线后网址会用到
- `main`：入口文件是哪个
- `compatibility_date`：按哪一天的平台行为跑，写一个近期日期即可（这里有个坑，后面讲）
- `triggers.crons`：定时任务规则，`*/5 * * * *` = 每 5 分钟跑一次

**文件二：`index.js`**（全部业务，32 行）：

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/count") {
      return Response.json({ site: "web-tools", today: 128, note: "demo" });
    }

    if (url.pathname === "/api/proxy") {
      const target = url.searchParams.get("url");
      if (!target) return new Response("missing ?url=", { status: 400 });
      const resp = await fetch(target);
      const body = await resp.text();
      return new Response(body, {
        headers: {
          "content-type": resp.headers.get("content-type") ?? "text/plain",
          "access-control-allow-origin": "*",
        },
      });
    }

    return new Response("try /api/count or /api/proxy?url=...", { status: 404 });
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      fetch("https://itzhouq.cn").then((r) =>
        console.log("radar-heartbeat:", r.status, new Date().toISOString())
      )
    );
  },
};
```

看不懂没关系，结构其实只有两块：

- **`fetch` 函数**：每来一个 HTTP 请求，就执行一次。里面就是一个路由判断——访问 `/api/count` 返回计数 JSON，访问 `/api/proxy` 替你去请求目标网址。
- **`scheduled` 函数**：每到定时点（配置里写的每 5 分钟），就执行一次。现在它只是访问一下我的博客打个心跳，之后换成"抓热词数据"就是新词雷达的雏形。

## 第二步：本地跑起来

```bash
npx wrangler dev
```

它会起一个和线上一模一样的本地运行时，默认地址 `http://localhost:8788`：

![实测：wrangler dev 启动后的请求日志](https://pic.itzhouq.cn/cfs03-20261021-dev-log.png)

## 第三步：把三个功能挨个测一遍

### 1. JSON 接口——"公共记账员"的雏形

```bash
curl http://localhost:8788/api/count
```

返回：`{"site":"web-tools","today":128,"note":"demo"}`。20 毫秒。任何网页、任何小程序、任何脚本都能请求这个地址拿到全站数据——这就是"一个 API"的全部。（这个 128 是写死的演示值；真版本怎么把数字存下来？文末有答案——**工具箱的真计数器已经上线了**。）

### 2. CORS 代理——那个"中间人"

```bash
curl "http://localhost:8788/api/proxy?url=https://example.com"
```

它替你去请求 `example.com`，把结果原样带回。关键是响应头里多了一行许可：

![实测：响应头里挂上了 CORS 许可](https://pic.itzhouq.cn/cfs03-20261021-cors-hdr.png)

`Access-Control-Allow-Origin: *` 意思是"所有人都可以用"。从此你的前端页面把这个 Worker 地址当中转站，浏览器就不再拦截——被 CORS 卡住的需求这样一次就通了。

### 3. 定时任务——新词雷达的骨架

配置里的 `*/5 * * * *` 会在上线后每 5 分钟自动执行一次 `scheduled` 函数。本地开发时它**不会自动跑**（官方文档明说），手动触发：

```bash
curl "http://localhost:8788/cdn-cgi/local/scheduled?cron=*+*+*+*+*&format=json"
```

返回 `{"outcome":"ok","noRetry":false}`，同时 dev 日志里打出了 `radar-heartbeat: 200`——定时函数真的执行了，里面的心跳请求也真的发出去过（见第一张截图的最后一行）。把心跳换成"抓热词 + 存下来"，就是新词雷达的后端。

三件事实测汇总：

![实测：三个关键动作的返回](https://pic.itzhouq.cn/cfs03-20261021-curl-api.png)

## 踩坑：compatibility_date 写超前了会拒启动

写这篇时我真实踩的：我把 `compatibility_date` 写成当天的 `2026-10-20`，`wrangler dev` 直接拒绝启动：

![实测：compatibility_date 超前时的真实报错](https://pic.itzhouq.cn/cfs03-20261021-compat-error.png)

原因：这个日期的意思是"按哪一天的平台行为跑"，官方推荐写当天，但你**本地**的 wrangler 自带的运行时可能还没跟上（我本机最高只支持 `2026-10-08`）。解法：降到本地支持的日期，或升级 wrangler。

## 上线：一条命令

```bash
npx wrangler deploy
```

推上去自动获得 `https://cf-demo.<你的子域>.workers.dev` 的全球可访问地址（首次部署会引导你注册一个免费的账号级子域名），自动 HTTPS，全球三百多个节点同时生效。想绑定自己的域名，控制台点几下就行。

回看这个流程：建两个文件 → `wrangler dev` 本地跑 → `wrangler deploy` 上线。没有 Git 集成、没有构建配置、没有服务器。对比一下[上一篇](https://itzhouq.cn/blog/cloudflare-free-series-02-deploy)里 Pages 的部署，Workers 更轻——因为整个后端就是那一个文件。

## 彩蛋：这篇写完，计数器已经真的上线了

教学版里计数是写死的，但我没打算让它停在 demo。写完这篇的当天，我把 32 行骨架变成了真产品，接进了[工具箱](https://tools.itzhouq.cn)：

- 加了一个 **KV 存储绑定**（Cloudflare 的键值数据库，免费额度足够），把每次使用次数真正存下来；
- 两个接口：`POST /api/hit` 记一次使用，`GET /api/stats` 查全站统计；
- 前端改动：打开任意工具页自动 +1，首页每张工具卡右上角显示全站累计的"已使用 N 次"。

Worker 部署在 [web-tools-counter.itzhouq.workers.dev](https://web-tools-counter.itzhouq.workers.dev)，线上实测：

![实测：线上真实计数器的 hit 与 stats 返回](https://pic.itzhouq.cn/cfs03-20261021-live-counter.png)

从"文章里的 32 行"到"网站上的真功能"，中间只隔了：一个 KV 绑定、两段各十几行的代码、一次 `wrangler deploy`。这就是这套免费架构最舒服的地方——**教学的终点和生产的起点是同一份代码**。

工具页右上角现在长这样（就是截图里红框那个小徽章）：

![实测：公众号封面工具页右上角的"已被使用 4 次"徽章](https://pic.itzhouq.cn/cfs03-20261022-usage-badge.png)

## 写在最后

回到开头的三件事：

- CORS 代理——今天这篇已经完整实现；
- 定时抓热词——骨架已就位，换掉心跳里的逻辑就是 macopenclaw 新词雷达的后端；
- 全站计数——**已经真的上线了**，就是上面那个彩蛋。

服务器时代做后端，一半时间写代码，一半时间伺候机器。Workers 把后一半砍成了零：32 行代码、两个文件、本地一跑、一键上线。每天 10 万次请求的免费额度，足够你的 side project 火到成为烦恼之前，一分钱都不用花。

有任何问题可以在评论区聊（giscus 已开通），也欢迎在 [GitHub](https://github.com/itzhouq) 关注我的开源项目。

## 相关链接

- 系列第一篇：[不买服务器的独立开发者：开一个「穷鬼套餐」系列](https://itzhouq.cn/blog/cloudflare-free-series-01-map)
- 系列第二篇：[穷鬼套餐 02：303 个文件，4.6 秒 0 元上线](https://itzhouq.cn/blog/cloudflare-free-series-02-deploy)
- 官方文档：[Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) / [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

这篇首发于我的博客 [itzhouq.cn](https://itzhouq.cn)，公众号同步连载。

## 关于作者

我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

这是穷鬼套餐系列第三篇（Workers API），后续实操全部在我博客 itzhouq.cn 与公众号同步连载。想交流 AI 搞副业、白嫖部署——**关注公众号「搞副业的老周itzhouq」，回复「微信」加我**，第一时间同步新文章和翻车现场。
