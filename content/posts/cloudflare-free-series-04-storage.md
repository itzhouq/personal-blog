---
title: 穷鬼套餐 04：5000 行的表，查 1 行烧 5000
date: 2026-10-23
tags: [独立开发, Cloudflare, 数据存储, 穷鬼套餐, AI]
draft: false
summary: 静态站和 API 都上线了，数据存哪？KV、D1、R2 三个免费存储一次讲透：一张决策表 + 6 个实测配额陷阱，包括 wrangler 默认写本地这种官方不强调的坑。我的计数器和图床全跑在 0 元架构上。
x_hooks: [穷鬼套餐 04：三个免费存储，6 个配额陷阱, 穷鬼套餐 04：D1 免费单库只有 500MB]
---

[上一篇文章](https://itzhouq.cn/blog/cloudflare-free-series-03-worker-api)之后，你的站能看、能算、能每天定时抓数据。但真要把玩具变成产品，迟早撞上同一个问题：**数据存哪？**

写这篇文章时我数了数自己账号里的存储资源，三个需求都是真实在跑的：

1. **工具箱的「已被使用 N 次」**——每个工具页右上角那个小徽章，全站共用一份计数。这个已经上线了，用的是 KV。
2. **图床 [pic.itzhouq.cn](https://pic.itzhouq.cn)**——这个博客、公众号文章的所有截图都从这走，2026 年 3 月建好跑到现在，用的是 R2。
3. **想给工具箱加个「收藏夹」**——用户登录后收藏工具，需要按用户查、多条件筛选。这个还没做，但我知道它得用 D1，因为它是真·关系型数据。

三个需求，三个产品。Cloudflare 的免费存储就三样：**KV、D1、R2**。选错了不会当场报错，而是某天凌晨你的额度悄悄烧穿。这篇把三个产品拆开讲：是什么、免费多少、怎么选、坑在哪。所有数字核验于 2026-10-23，所有命令都在我自己账号上真实跑过——包括我踩的那个坑。

> 声明：本系列与 Cloudflare 官方无任何关系，属于个人经验分享。文中额度均标注核验日期（2026-10-23），以[官方定价页](https://developers.cloudflare.com/workers/platform/pricing/)和各产品 Limits 文档为准。

## 先纠正我自己的两个错误

开篇那篇我把 D1 写成「5 GB SQLite 数据库」，KV 只写了「1 GB 存储、10 万次读/天」。都不够准确，这篇纠正：

- D1 的 5 GB 是**账号总量**，单个数据库的上限只有 **500 MB**；
- KV 还有一条开篇没提的要命限制：**每天只能写 1000 次**。

这两个数字直接决定选型，所以放最前面说。

## 一分钟版本：三张卡

| | Workers KV | D1 | R2 |
|---|---|---|---|
| 是什么 | 全球键值存储 | 托管 SQLite 数据库 | S3 兼容对象存储 |
| 读额度 | 10 万次/天 | 500 万行/天 | 1000 万次/月（Class B） |
| 写额度 | **1000 次/天**（同 key 1 次/秒） | 10 万行/天 | 100 万次/月（Class A） |
| 容量 | 1 GB | 单库 500 MB / 账号 5 GB | 10 GB |
| 一致性 | 最终一致（最长 60 秒+） | SQL 事务，强一致 | 单对象强一致 |
| 适合 | 配置、缓存、低频计数 | 结构化数据、SQL 查询 | 大文件、图片、备份 |
| 超额会怎样 | 当天报错，**不扣钱** | 当天报错，**不扣钱** | **开始计费** |

最后一行是三者最大的差别：KV 和 D1 超额是「断供」，R2 超额是「扣钱」。R2 免费层用超了不会断服务，但会按 $0.015/GB·月、$4.50/百万次 Class A 计费——个人用量几乎永远到不了付费线，但这个差别值得知道。

翻译成人话：

- **KV**：一个全球字典。读飞快，写抠门；
- **D1**：一个正经 SQLite。会建索引就能为所欲为，但每一次全表扫描都记账；
- **R2**：一个不限出口流量的网盘。S3 协议，PicGo 能直连。

（还有一个 Durable Objects，强一致 + 事务，实时协作类需求用它。本篇不展开，记住「KV 和 D1 都搞不定一致性时找它」就行。）

## 一张决策表：什么数据放哪

| 你的数据长这样 | 放哪 | 为什么 |
|---|---|---|
| 功能开关、配置、灰度名单 | KV | 读多写少，全球边缘缓存，热 key 读取亚毫秒 |
| 低频计数器（每天几百次） | KV | 写分散到不同 key，远离 1000 次/天的线 |
| 用户偏好、会话状态 | KV | 最终一致性完全可以接受 |
| 结构化业务数据（用户、订单、内容） | D1 | 关系型模型，SQL 随便查 |
| 多条件筛选、排序、分页、聚合 | D1 | 这是 SQL 的主场，KV 会累死 |
| 图片、视频、安装包、备份文件 | R2 | 大对象 + 出口流量免费 |
| 图床、用户上传的文件 | R2 | S3 API + 自定义域名，现成工具全兼容 |
| 强一致、事务、实时协作 | Durable Objects | KV 最终一致、D1 单库单线程，都不适合 |

判断顺序建议就三步：**是文件吗**？是 → R2。**要 SQL 查吗**？要 → D1。**就是个键值对、读多写少**？→ KV。三个产品的边界比想象中清晰，真正难的是承认自己的需求有多大——我的经验是，个人项目 90% 的数据用 KV 就够了，但剩下 10% 你别硬扛。

## 我的三个真实案例

- **计数器 → KV**。我的[工具箱](https://tools.itzhouq.cn)每个工具显示「已使用 N 次」。读写模式是典型的读多写少：每次打开工具页写 1 次（其实前端防重，实际更少），每次浏览都读。写分散在 10 个工具 key + 当天日期 key + 一个 total，一天几十次写入，离 1000 的上限远到看不见。
- **图床 → R2**。`pic` 桶，2026-03-31 创建，PicGo 通过 S3 API 直传，绑个自定义域名就是公网图床。跑了大半年，文章截图全走这，出口流量免费。
- **收藏夹 → D1（计划中）**。需要按用户查、按时间排序、要去重——这是关系型数据的形状。等真要做的那天，建库 5 分钟。

顺便交代一个诚实的细节：我账号里有一个 2026-07-06 建的 D1 数据库 `color-memory-game-v2`，到现在 **0 张表**——当时给一个游戏项目建的，后来需求变了，它就这么空着。免费额度给的底气就是这个：建十个库放着不花钱，删了也就一条命令。

## 实操一：KV，先把计数器讲透

建 namespace、写、读、列，四条命令：

```bash
npx wrangler kv namespace create CFS04_DEMO
npx wrangler kv key put --remote --namespace-id <namespace-id> "demo:greeting" "hello from 穷鬼套餐04"
npx wrangler kv key get --remote --namespace-id <namespace-id> "demo:greeting"
npx wrangler kv key list --remote --namespace-id <namespace-id>
```

![实测：KV namespace 创建、写入、读取、列出](https://pic.itzhouq.cn/cfs04-20261023-kv.png)

光有 demo 没意思，直接看我线上真跑的计数器。它的 key 设计就是上面说的「分散写」：`tool:xxx` 每个工具一个 key，`day:2026-10-22` 按天一个 key，外加一个 `total`：

![实测：线上计数器的真实 key 列表和 stats 接口](https://pic.itzhouq.cn/cfs04-20261023-counter.png)

注意截图里那个 **`tool:unknown`**——这是写这篇时我拿一个不存在的工具名试了试 hit 接口，KV 里真的就多了一个键。两个教训：第一，计数器的键空间是暴露的，脏数据会真实进来（生产版应该加白名单）；第二，KV 的模型就是这么直白——**写一个不存在的键，它就存在了**，没有 schema 保护你。

KV 的三个坑，按严重程度排：

1. **写上限 1000 次/天，同 key 1 次/秒**。拿 KV 做高频计数器（比如每页 PV 都 +1）会当场去世。我的用法是每个工具一个 key 分散写，但如果你的站流量大到一个工具一天被用几千次，要么接受当天断供，要么换 D1 / Durable Objects。
2. **最终一致性**。官方文档原话：写入位置通常立即可见，其他位置最长要 **60 秒以上**。表现就是：你在上海刚 +1，北京的用户读到的可能还是旧值。对计数器无所谓，对「发布后立刻看到阅读数 1」也无所谓——但对库存、抢购、抽奖，这是灾难。那种需求别用 KV。
3. **读多才是它的主场**。热 key 的重复读取延迟在 500µs~10ms，这是它免费额度这么抠还能活到现在的原因。

## 实操二：D1，5000 行的表教我做人的一天

建库、建表、灌数据，三步：

```bash
npx wrangler d1 create cfs04-demo
npx wrangler d1 execute cfs04-demo --remote --command "CREATE TABLE tool_hits (id INTEGER PRIMARY KEY AUTOINCREMENT, tool TEXT NOT NULL, hits INTEGER NOT NULL DEFAULT 0)"
npx wrangler d1 execute cfs04-demo --remote --command "WITH RECURSIVE cnt(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM cnt WHERE i < 5000) INSERT INTO tool_hits (tool, hits) SELECT 'tool-' || i, i FROM cnt"
```

![实测：D1 建库、建表、递归 CTE 灌 5000 行](https://pic.itzhouq.cn/cfs04-20261023-d1.png)

看截图里 CREATE TABLE 那条的 meta：**`rows_read: 2, rows_written: 4`**——建个空表自己就产生了 2 次读、4 次写。官方文档明说 DDL（CREATE/ALTER/DROP）会混合计入读写额度。这意味着：**在 D1 上做数据迁移不是免费的**，改一次表结构就是几百上千的额度消耗，批量 UPDATE 更是要切成小批跑。

灌完 5000 行，好戏开始。同一条查询，先不建索引：

![实测：同一条查询，索引前后的 rows_read 对比（5000 vs 2）](https://pic.itzhouq.cn/cfs04-20261023-d1-trap.png)

把三条命令的 meta 摆在一起看：

| 操作 | 返回行数 | rows_read | rows_written |
|---|---|---|---|
| `SELECT ... WHERE tool='tool-4321'`（无索引） | 1 | **5000** | 0 |
| `CREATE INDEX ...` | — | 10041 | 5001 |
| `SELECT ... WHERE tool='tool-4321'`（有索引） | 1 | **2** | 0 |

这就是标题的由来：**5000 行的表查 1 行，烧掉 5000 行额度**。官方定义写得很清楚——rows_read 数的是**扫描行数**，不是返回行数。一条没走索引的 `WHERE`，SQLite 把全表翻了一遍才找到你要的那 1 行。免费额度 500 万行/天听着很多？一次全表扫描 5000，你的接口被调 1000 次就烧穿。

索引是解药，但不是免费的：建索引这一次性花了 10041 读 + 5001 写（它要读全表、把索引页全写一遍），而且之后每次写索引列都会多 1 行写（表 1 行 + 索引 1 行）。**这是一笔典型的一次性投资换长期节省**——我的 5000 行小表都回本了，你的表越大越值。

D1 其余的坑：

- **免费单库 500 MB、账号总量 5 GB、最多 10 个库**。个人怎么都用不完，但「建第 11 个库」和「单库超 500MB」都是硬墙，超了不是断供就是得删数据。官方对 D1 的设计哲学就是「水平拆成多个小库」，不是「一个巨库扛所有」。
- **每次 Worker 调用最多 50 条查询**。批量操作用 `batch()` 合并，官方原话：把多条语句打包成一次请求，省下的是每请求的固定开销。
- **单库单线程，一次只跑一条查询**。吞吐 ≈ 1 除以查询耗时：1ms 的查询能跑 1000 QPS，100ms 的慢查询只剩 10 QPS。D1 慢查询是双杀——既烧 rows_read 又压吞吐。
- **Time Travel 7 天（免费）**。误删表能找回，这是免费层白送的生产保险，知道有它比用到它重要。

调优神器就在每次执行的返回里：`meta.rows_read` / `meta_written` 直接告诉你这条查询烧了多少。控制台和 analytics API 也能按库、按天看——**先量再改，别凭感觉建索引**。

## 实操三：R2，和那个「默认写本地」的坑

R2 的流程和 KV 一样直白：

```bash
npx wrangler r2 bucket create cfs04-demo
npx wrangler r2 object put cfs04-demo/demo.txt --remote --file r2-demo.txt
npx wrangler r2 object get cfs04-demo/demo.txt --remote --file out.txt
```

但我要把一个真实的翻车现场放上来——本文最值钱的一段。我第一次执行 put 时**忘了加 `--remote`**：

![实测：不加 --remote，put 显示成功，线上却查无此键](https://pic.itzhouq.cn/cfs04-20261023-r2.png)

看截图里发生了什么：put 输出 `Resource location: local`，然后 `Upload complete.`——**不报错，显示成功**。紧接着我用 `--remote` 去 get，`✘ [ERROR] The specified key does not exist.` 东西根本不在线上，它在本地模拟环境里。wrangler 的 `kv` 和 `r2` 子命令默认打本地，这个行为官方文档有写，但写在角落里，第一次用的人（比如我）必然踩。**记住：动线上数据，`--remote` 不能省。**

加上 `--remote` 重传，一切正常。我的图床就是这么验证的——`pic` 桶绑上自定义域名，一次真实的公网读取：

![实测：图床域名线上读取，HTTP/2 200](https://pic.itzhouq.cn/cfs04-20261023-pic.png)

R2 的坑集中在计费模型上：

- **Class A / Class B 分开算**。读文件（`GetObject`）是 B 类，1000 万次/月；写文件、列目录（`ListObjects`）、拷贝都是 A 类，只有 100 万次/月。**别用 ListObjects 做前端文件列表**——那是拿贵 12.5 倍的操作当白菜用。删除操作免费，这个设计很良心。
- **免费层只含 Standard 存储**。Infrequent Access 不适合个人场景，忽略即可。
- **超额是计费不是断供**。$0.015/GB·月、$4.50/百万次 Class A——我的图床跑了大半年，用量在免费层内，账单 0 元。
- 单个对象多大都行（GB 级），这是 R2 和 KV（value 25 MiB 上限）的分工线。

## 踩坑清单（6 条，全是实测）

1. **wrangler 的 kv/r2 子命令默认 local**——不加 `--remote`，命令显示成功但东西在本地。本文 R2 截图就是现场。
2. **D1 的 rows_read 按扫描行数计费**——没索引的 WHERE = 全表扫描。每个查询条件先建索引，用返回的 `meta.rows_read` 验证。
3. **D1 免费单库只有 500 MB**——5 GB 是账号总量，且全账号最多 10 个库。开篇那篇我写错了，这篇纠正。
4. **KV 每天 1000 次写、同 key 1 次/秒**——高频计数器别用 KV；写要按业务拆成多个 key 分散。
5. **KV 最终一致性最长 60 秒+**——写完立刻读可能读到旧值。涉及金钱、库存、抢赠的场景，换 D1 或 Durable Objects。
6. **R2 的 A/B 类操作差 12.5 倍**——`ListObjects` 是 A 类，别拿它做文件浏览器；超额开始计费，记得在控制台看用量。

## 算一笔账

我账号里现在跑着的存储：3 个 KV namespace（计数器 + 两个杂项）、1 个 D1（空着）、5 个 R2 桶（图床 + 几个项目资源）。月度成本：**0 元**。域名一年几十块，那是这个系列第八篇的事。

这就是「穷鬼套餐」的核心主张：个人开发者的数据需求，99% 在这三个免费层的交集里。剩下 1% 真超了，D1 升级到 Workers Paid（$5/月）是明码标价的，不会被 surprise bill 偷袭。

## 写在最后

回到开头的三个需求：计数器用 KV，已经上线；图床用 R2，跑了大半年；收藏夹用 D1，等立项那天建库只要 5 分钟。选型的本质不是「哪个技术牛」，是**你的数据长什么形状**——文件进 R2，要 SQL 进 D1，其余进 KV。

这篇文章的 demo 资源（一个 KV namespace、一个 D1 库、一个 R2 桶）我已经删掉了，清理命令一并给你：

```bash
npx wrangler kv namespace delete --namespace-id <namespace-id>
npx wrangler d1 delete cfs04-demo -y
npx wrangler r2 object delete cfs04-demo/demo.txt --remote
npx wrangler r2 bucket delete cfs04-demo
```

下一篇回归白嫖主业：**R2 图床实战**——PicGo 怎么配、自定义域名怎么绑、S3 兼容层有哪些暗坑，把我这个大半年零故障的图床方案完整拆给你。

有任何问题可以在评论区聊（giscus 已开通），也欢迎在 [GitHub](https://github.com/itzhouq) 关注我的开源项目。

## 相关链接

- 系列第一篇：[不买服务器的独立开发者：开一个「穷鬼套餐」系列](https://itzhouq.cn/blog/cloudflare-free-series-01-map)
- 系列第二篇：[穷鬼套餐 02：303 个文件，4.6 秒 0 元上线](https://itzhouq.cn/blog/cloudflare-free-series-02-deploy)
- 系列第三篇：[穷鬼套餐 03：32 行代码，10 万次调用，0 元](https://itzhouq.cn/blog/cloudflare-free-series-03-worker-api)
- 我的工具箱（计数器线上案例）：[tools.itzhouq.cn](https://tools.itzhouq.cn)
- 官方文档：[KV Limits](https://developers.cloudflare.com/kv/platform/limits/) / [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/) / [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) / [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) / [存储选型指南](https://developers.cloudflare.com/workers/platform/storage-options/)

这篇首发于我的博客 [itzhouq.cn](https://itzhouq.cn)，公众号同步连载。

## 关于作者

我是 **搞副业的老周 itzhouq**：10 年后端程序员，湖北农村自学编程转行，人在上海——白天写代码，晚上带娃，剩下的时间用 AI Agent 折腾副业。做的东西、流量数据、赚没赚到钱，全部公开，失败了也发。

这是穷鬼套餐系列第四篇（数据存储），后续实操全部在我博客 itzhouq.cn 与公众号同步连载。想交流 AI 搞副业、白嫖部署——**关注公众号「搞副业的老周itzhouq」，回复「微信」加我**，第一时间同步新文章和翻车现场。
