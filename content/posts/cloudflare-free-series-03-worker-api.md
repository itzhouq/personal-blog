---
title: 穷鬼套餐 03：37 行代码，10 万次调用，0 元
date: 2026-10-21
tags: [独立开发, Cloudflare, Workers, 穷鬼套餐, AI]
draft: true
summary: 有静态站还不够：转发代理、定时任务、webhook，这些都需要一个后端。这篇用 37 行真实代码写一个 Workers API——JSON 接口、CORS 代理、定时任务三合一，本地实测全程记录，附免费额度账本和今天刚踩的坑。
x_hooks: [穷鬼套餐 03：不用买服务器，你的第一个 API 今天就能上线]
---

前两篇我们把静态站送上了全球 CDN（没看的[点这里](/blog/cloudflare-free-series-02-deploy)）。但网站跑起来之后你很快会撞上第二面墙：**光有页面不够**。

想给工具加个在线计数、想转发一个被 CORS 拦住的第三方接口、想每天早上自动抓个数据推给自己、想接一个 webhook——这些活都需要"一个后端"。传统的答案是一台服务器：买、装环境、配 nginx、开端口、防攻击、每月交钱。

这个系列的答案永远是另一个方向。这篇讲 **Workers**：Cloudflare 的 Serverless 函数平台，免费 10 万次请求/天，37 行代码就能撑起一个个人开发者的全部后端需求。

> 声明：本系列与 Cloudflare 官方无任何关系。文中额度核验于 2026-10-21，以[官方定价页](https://developers.cloudflare.com/workers/platform/pricing/)为准；本篇所有代码都在我机器上真实跑过，输出为实测记录。

## Workers 是什么：不是服务器，是“函数贴着你跑”

一句话：你写一个函数上传上去，Cloudflare 把它复制到全球三百多个数据中心，谁请求就在谁旁边执行。没有机器要管，没有进程要守，没人请求就一分钱不花。

它的对手不是"服务器"，而是你"要不要做这件事"——因为门槛被压到了：会写一个 JS 函数，就会部署一个后端。

## 免费额度账本（核验于 2026-10-21）

| 项目 | 免费额度 | 人话 |
|---|---|---|
| 请求数 | 100,000 次/天 | 每天十万次 API 调用，个人项目根本用不完 |
| CPU 时间 | 10ms/次 | 注意是**计算时间**，不是响应时间（下面细说） |
| 静态资源请求 | 不限、不计费 | 配合静态站用，全是白送 |
| Cron 定时触发 | 有，计入请求数 | 定时任务也白送 |
| 超额后 | 当类操作报错，不会扣钱 | 撑爆了也只是当天报错，不会收到账单 |

最后一行值得再说一遍：免费套餐超限的后果是**报错**，不是**扣费**。睡得着觉。

那个"10ms CPU"吓退过很多人，其实是个误会：它只计你代码真正运算的时间，`fetch` 等第三方接口返回的等待时间**不算在内**。也就是说转发代理、调 API 拼数据这类最常见的活，几乎不可能撞线。

## 实战：一个文件，两个功能

建个文件夹，两个文件。第一个是 `wrangler.jsonc`（项目配置）：

```jsonc
{
  "name": "poorguy-demo",
  "main": "index.js",
  "compatibility_date": "2026-10-08",
  "triggers": { "crons": ["*/5 * * * *"] }
}
```

第二个是 `index.js`，全部业务就这一个文件——一个 JSON 接口 + 一个带 CORS 的转发代理 + 一个定时心跳，37 行：

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1. 极简 JSON API
    if (url.pathname === "/api/time") {
      return Response.json({
        utc: new Date().toISOString(),
        note: "hello from the edge",
      });
    }

    // 2. 带 CORS 的转发代理
    if (url.pathname === "/proxy") {
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

    return new Response("try /api/time or /proxy?url=...", { status: 404 });
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      fetch("https://itzhouq.cn").then((r) =>
        console.log("heartbeat:", r.status, new Date().toISOString())
      )
    );
  },
};
```

这两段就是 Workers 的一辈子：`fetch` 处理每个 HTTP 请求，`scheduled` 处理定时触发（配置里写了每 5 分钟一次）。转发代理那几行是前端开发者的老朋友——前端调第三方接口被 CORS 拦时，一个加了 `access-control-allow-origin: *` 的中转就把问题解决了。

## 本地开发：一条命令起服务

```bash
npx wrangler dev
```

`localhost:8787` 直接起一个和线上一致的运行时。三个端点实测（真实输出）：

![实测：三个端点的真实返回](https://pic.itzhouq.cn/cfs03-20261021-curl-api.png)

JSON 接口通了，代理把 example.com 的页面原样带了回来，CORS 头已挂上。开发时的请求日志长这样：

![实测：wrangler dev 的请求日志](https://pic.itzhouq.cn/cfs03-20261021-dev-log.png)

**今天刚踩的坑，写给你**：`compatibility_date` 不能超过你本地 wrangler 支持的日期。我配置里写了 `2026-10-20`，`wrangler dev` 直接拒绝启动——报错说本地运行时二进制最高只支持 `2026-10-08`。这个字段的含义是"我的代码按哪一天的平台行为来跑"，写当前日期是官方推荐，但本地工具链没跟上就会起不来。解法：降到本地支持的日期，或升级 wrangler。

## 定时任务：本地怎么测

cron 在本地**不会自动跑**（官方文档明说），手动触发：

```bash
curl "http://localhost:8787/cdn-cgi/local/scheduled?cron=*+*+*+*+*&format=json"
```

实测返回 `{"outcome":"ok","noRetry":false}`，同时 dev 日志里打出了 `heartbeat: 200`——`scheduled` 里的心跳请求真的执行了。上面的截图里能看到这一行。

部署之后就是真·定时任务了：线上每 5 分钟自动跑一次，改 cron 表达式就行（注意所有 cron 按 **UTC** 时间执行，北京的早上八点是 UTC 0 点，写错了任务会在半夜跑）。

## 上线：一条命令

```bash
npx wrangler deploy
```

没有 Git 集成、没有构建配置，推上去直接获得 `https://<项目名>.<你的子域>.workers.dev` 的全球可访问地址（首次部署会让你注册一个账号级子域名），自动 HTTPS。想绑自己的域名也是控制台点几下的事。

回头看一眼:上一篇 Pages 的"构建配置三件套"在 Workers 这儿不存在了——因为它不需要构建，一个 JS 文件就是全部。这也是官方现在建议新项目直接用 Workers 的原因之一（[上篇聊过这个演进](/blog/cloudflare-free-series-02-deploy)）。

## 37 行能干什么：真实场景清单

这 37 行的骨架（路由 + fetch + 返回）几乎是万能的，换换内脏就是：

- **CORS 代理**：前端直连被拦的第三方接口，中转一次就通（本篇已实现）
- **webhook 中转**：支付回调、GitHub 事件，验个签再转发到飞书/邮件
- **定时抓取**：cron + fetch 抓行情/榜单，存 KV 或推通知（本篇骨架已就位）
- **短链服务**：KV 存映射，20 行搞定跳转
- **AI 接口网关**：统一转发到大模型 API，塞 Key 的地方收在服务端而不是前端

你会发现这些全是"个人开发者的零碎后端需求"，以前每一个都是"要不买台服务器吧"的理由，现在每一个都是"一个 Worker 的事"。

## 写在最后

服务器时代做后端，一半时间写代码，一半时间伺候机器。Workers 把后一半砍成了零：37 行代码、两个文件、`wrangler dev` 本地跑、`wrangler deploy` 上全球。

免费额度对个人开发者来说是"用不完"级别——每天 10 万次请求，你的 side project 得先火到成为烦恼，才需要考虑付费的事。

下一篇把数据这块补上：API 无状态能解决一半问题，另一半要存东西——KV、D1、R2 怎么选，配额陷阱避坑清单，见。

有任何问题可以在评论区聊（giscus 已开通），也欢迎在 [GitHub](https://github.com/itzhouq) 关注我的开源项目。

## 相关链接

- 系列第一篇：[不买服务器的独立开发者：开一个「穷鬼套餐」系列](/blog/cloudflare-free-series-01-map)
- 系列第二篇：[穷鬼套餐 02：303 个文件，4.6 秒 0 元上线](/blog/cloudflare-free-series-02-deploy)
- 官方文档：[Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) / [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

这篇首发于我的博客 [itzhouq.cn](https://itzhouq.cn)，公众号同步连载。

## 关于作者

我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

这是穷鬼套餐系列第三篇（Workers API），后续实操全部在我博客 itzhouq.cn 与公众号同步连载。想交流 AI 搞副业、白嫖部署——**关注公众号「搞副业的老周itzhouq」，回复「微信」加我**，第一时间同步新文章和翻车现场。
