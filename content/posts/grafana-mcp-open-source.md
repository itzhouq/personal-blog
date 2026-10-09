---
title: 让 AI 看见"运行时"：grafana-mcp 开源复盘
date: 2026-10-07
tags: [MCP, AI, Grafana, 可观测性, 开源]
summary: AI 写代码很顺，但排查线上问题时它对日志、指标、链路一无所知——把 Grafana 上下文嵌进编码工作流的 MCP server 做好了，今天开源。聊聊双环境设计、那个"非交互 shell 读不到 .zshrc"的坑，以及 npm 首发 + MCP Registry 收录的完整流程。
draft: true
---

上一篇[《让 AI 只读"看见"生产库》](/blog/archery-mcp-open-source)讲的是让 AI 看见**数据**（表结构、索引、数据特征）。这篇补上另一半：让 AI 看见**运行时**——日志、指标、链路追踪。

[grafana-mcp](https://github.com/itzhouq/grafana-mcp) 今天开源了，`npx grafana-mcp` 即用。这篇照例是复盘：为什么做、怎么设计的、开源过程踩了什么坑。

## 从一个熟悉的场景说起

测试阶段 QA 反馈了一个 bug，说某个接口行为不对。接下来通常是：

1. 打开日志平台（Grafana / Loki），切到 test 环境，搜应用名，翻日志
2. 找到报错，复制堆栈，贴给 AI 编码助手："帮我看看这是怎么回事"
3. AI 分析堆栈 → 改代码 → 部署 test → 你再切回日志平台确认报错消失了

整个循环里，AI 只见到了一块"二手"的、你手工截取的日志片段。它看不到上下文时间线，看不到关联服务的报错，看不到指标异常，更不能在修复后自己去验证日志是否干净。**排查问题的人是你，AI 只是打字员。**

线上排查更是如此：告警响了 → 开 Grafana → 搜日志 → 看指标 → 定位到某个接口变慢 → 查链路。每一步都是人工在"搬运"证据给 AI。

如果 agent 在写代码、修 bug 的同时能**自己**查日志、查指标、查链路，上面这个循环会变成：QA 反馈 → agent 调 `project_context` 对齐项目 → 自己查 test 日志定位 → 修复 → 自己查日志确认恢复。人只做判断。

## 三个实际障碍

直接拿通用 MCP 封装一层 Grafana API，解决不了这三个日常使用里的真障碍：

**第一，每个项目会话都要口头交代"我们在 Grafana 里叫什么"。** 不同项目的 app 标签、namespace、pod 前缀都不一样，靠对话里说，agent 会跑偏。解法：项目根放一个 `.grafana.json`，声明 app、namespace、默认环境，agent 调一次 `project_context` 全部对齐。这个文件对 agent 可见可解释，比藏在环境变量里强。

**第二，test 和 prod 是两套环境，凭据和域名都不同。** 我把两个环境的变量都放在 `~/.zshrc` 里（`GRAFANA_TEST_URL` / `GRAFANA_PROD_URL` 这样成对出现）。这里撞上了一个非常隐蔽的坑：

> **MCP server 是被客户端 spawn 出来的非交互、非登录 shell，它不会 source 你的 `.zshrc`。**

所以那些变量在 MCP server 进程里根本不存在。而且 `switch_environment` 切换环境这件事，光靠环境变量也做不了——切换必须发生在 server 进程内部。解法是个有点 hack 但很稳的设计：**server 启动时直接读 `~/.zshenv` / `~/.zshrc` 的文件文本**，用正则提取 `GRAFANA_{ENV}_*` 变量。不依赖 shell 环境，改完 rc 文件重启会话即生效，两边环境的凭据互不干扰。

**第三，多数据源实例上"按类型取第一个"会选错。** 实例里常有多个 Loki / Prometheus，自动发现拿到的不一定是你要的。解法：支持显式配置数据源 UID，且可以按环境分别指定。

## 为什么不直接用官方 mcp-grafana

Grafana 官方有个 [mcp-grafana](https://github.com/grafana/mcp-grafana)（Go 实现），工具集很全。但它的定位是"面向一个全局实例的管理面板"，和我的场景有两个错位：它没有"项目上下文"的概念——每个会话还是要口头对齐 app 标签；也没有 test/prod 双环境的一等支持。

两者可以并存：要全量 Grafana 管理能力用官方的；要"每个业务项目开箱即用的日志/指标排查上下文"，用这个。

另外一个刻意的设计取舍：**零依赖单文件 TypeScript，bun 直接运行**。没有 `npm install`，没有构建，`bun run index.ts` 就是全部。一千行左右，随时可以整文件读完。代价是要求本机有 bun——Node 兼容的编译产物在 Roadmap 上。

工具一共 10 个，全部只读：`project_context` / `switch_environment` / `loki_query` / `loki_labels` / `prom_query` / `prom_instant` / `tempo_search` / `tempo_trace` / `alerts` / `datasources`。查询结果超 6 万字符自动截断，命中 limit 上限会明确提示可能还有更多——防止 agent 被海量日志撑爆上下文。

## 开源过程复盘

和 archery-mcp 一样，这是公司痛点驱动的周边工具，代码 100% 业余时间自研。开源前的准备工作这次轻车熟路，但还是有新东西。

**脱敏这次是"零容忍"标准。** 上次开源留下的规矩：任何公司标识词——包括域名、应用名、namespace、数据源 UID、真实 pod 前缀——都不能出现在公开仓库里，**连作为反面例子出现都不行**。这次的做法是把具体词表放进一个 gitignore 的本地文件，仓库里只提交一个通用的扫描脚本，CI 和本地跑同一套逻辑。敏感词本身永远不进公开仓库，否则扫描脚本就成了泄漏源。

**git 提交身份的教训这次躲过了，但要写出来。** 上次开源时发现历史提交全用的公司邮箱，只能推倒重建历史。这次项目从一开始就配置了仓库级身份，但仍然检查了一遍 `git log` 的每一列——因为配置生效前的那几个提交不会自己变干净。规则很简单：`git log --format='%an <%ae>'` 逐行核对，不是个人邮箱就重建历史。仓库只有几个提交时，重建的成本远低于任何清洗方案。

**npm 首发比 PyPI 简单，但有个时序坑。** 本机 `npm publish` 一分钟发完，不需要 token 也不需要 Trusted Publishing（后者是 GitHub Actions 自动发版才需要的，留给后续配置）。坑在 CI：我设计了 tag 驱动的发版流水线——push `v*` tag → Release workflow 发 npm → 成功后自动发布到 MCP 官方 Registry。但 npm 发布后元数据生效有延迟，守卫步骤 `npm view grafana-mcp@0.1.x` 暂时查不到刚发的版本，误判"未发布"就去重发，在 CI 里没凭据直接失败。最后给守卫加了轮询：探测不到就等 10 秒再试，最多 3 分钟。

**MCP Registry 对 npm 包的校验和 PyPI 不一样。** PyPI 包在 README 里放 `mcp-name:` 令牌就能通过归属校验；npm 包必须**在 package.json 里加 `"mcpName"` 字段**。这个差异让我白跑了一次发布流程。现在两个项目的发版链路都是全自动的：

```text
git tag v0.x.y && git push --tags
  → GitHub Actions 发 npm（已发布的版本自动跳过）
  → 成功后自动发布到 MCP 官方 Registry
```

收录地址：[io.github.itzhouq/grafana-mcp](https://registry.modelcontextprotocol.io)，仓库 [github.com/itzhouq/grafana-mcp](https://github.com/itzhouq/grafana-mcp)（README 有完整的接入方式、配置优先级和安全声明）。

## 安全边界

这类工具的敏感点在于凭据和输出，处理原则写进了 README：

- 全部 10 个工具只读，无任何写操作；建议用 Viewer 角色的专用账号
- 密码只在本机内存中出现，`project_context` 输出自动脱敏
- 日志/指标输出可能包含业务敏感信息，工具的职责是查询，分享边界的判断留给使用者——这点在 README 里声明得很直白

## Roadmap 与下一篇

接下来想做：Node 兼容编译产物（降低 bun 前提）、仪表盘面板数据读取。欢迎 issue 提需求。

如果你也在让 AI 嵌进自己的开发工作流，这两个项目可以搭配使用：[archery-mcp](https://github.com/itzhouq/archery-mcp) 负责"看数据"，[grafana-mcp](https://github.com/itzhouq/grafana-mcp) 负责"看运行时"。工具全集在 [itzhouq.cn/tools](https://itzhouq.cn/tools) 持续更新，这篇首发于[我的博客](https://itzhouq.cn)，下一篇可能聊聊这套"tag 驱动全自动发版"流水线本身。

---

**相关链接**

- 仓库：[grafana-mcp](https://github.com/itzhouq/grafana-mcp) · [archery-mcp](https://github.com/itzhouq/archery-mcp)
- 前篇：[让 AI 只读"看见"生产库：archery-mcp 开源复盘](/blog/archery-mcp-open-source)
- 工具集：[itzhouq.cn/tools](https://itzhouq.cn/tools)
- MCP Registry：[io.github.itzhouq/grafana-mcp](https://registry.modelcontextprotocol.io)
