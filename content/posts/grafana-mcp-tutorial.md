---
title: 让 AI 自己查日志：grafana-mcp 接入教程（双环境 + 项目上下文）
date: 2026-10-26
tags: [MCP, AI, Grafana, 可观测性, 教程]
summary: AI 改完代码能不能自己去日志平台确认"报错消失了"？grafana-mcp 就是干这个的。这篇是接入教程：装 bun、配双环境变量、写 .grafana.json 项目上下文，然后直接用嘴排查线上问题。全程只读，十个工具。
column: tutorial
---

[grafana-mcp](https://github.com/itzhouq/grafana-mcp) 解决的问题一句话：**别再人工搬运日志片段给 AI 了**。QA 报了个 bug，AI 自己查 test 日志定位、修复、再自己查一遍确认恢复——人只做判断。

复盘文在路上了，这篇先解决"怎么接"。

## 前置条件

本机装 [bun](https://bun.sh)（`curl -fsSL https://bun.sh/install | bash`）。项目是零依赖单文件 TypeScript，bun 直接跑，没有 npm install 环节。

## 第一步：双环境变量写进 ~/.zshenv

test 和 prod 两套 Grafana，凭据成对出现：

```bash
# ~/.zshenv
export GRAFANA_TEST_URL="https://grafana-test.你的域名.com"
export GRAFANA_TEST_USER="viewer账号"
export GRAFANA_TEST_PASSWORD="..."
export GRAFANA_PROD_URL="https://grafana-prod.你的域名.com"
export GRAFANA_PROD_USER="viewer账号"
export GRAFANA_PROD_PASSWORD="..."
```

**注意是 `~/.zshenv` 不是 `~/.zshrc`**——这是我踩过最隐蔽的坑：MCP server 是被客户端 spawn 出来的非交互 shell，它不 source `.zshrc`，写在 rc 文件里的变量在 server 进程里根本不存在。写在 zshenv 里（或者任何 server 能读到的文件里），改完重启会话生效。

prod 建议用 Viewer 角色的专用账号：这个 MCP 十个工具全部只读，但最小权限永远是对的。

## 第二步：项目根放一个 .grafana.json

不同项目的 app 标签、namespace 都不一样，靠对话口头交代，AI 会跑偏。在项目根放一个声明文件：

```json
{
  "app": "你的应用名",
  "namespace": "你的namespace",
  "defaultEnvironment": "test"
}
```

agent 调一次 `project_context` 就全部对齐，之后查日志、指标自动带上正确标签。这个文件对 AI 可见可解释，进了 git 全项目共享。

## 第三步：接进 Claude Code

```bash
claude mcp add grafana -- bun run /path/to/grafana-mcp/index.ts
```

或者 clone 仓库后按 README 里的配置段写 MCP 配置。装完让 AI 调一下 `datasources`，能列出你的 Loki / Prometheus / Tempo 就通了。

## 十个工具怎么用

全部只读：`project_context` / `switch_environment` / `loki_query` / `loki_labels` / `prom_query` / `prom_instant` / `tempo_search` / `tempo_trace` / `alerts` / `datasources`。

日常你不需要记它们，直接说人话：

> test 环境的 order-service 最近一小时有没有报错？有就把堆栈拉出来，关联指标也看一眼。

agent 会自己对齐项目上下文、查日志、拉指标。查到 6 万字符会自动截断并提示——上下文不会被海量日志撑爆。

## 和官方 mcp-grafana 什么关系

Grafana 官方的 [mcp-grafana](https://github.com/grafana/mcp-grafana) 是"面向全局实例的管理面板"，工具全但不知道你项目是谁。这个项目是"每个业务项目开箱即用的排查上下文"——两者并存不冲突。

## 相关链接

- 仓库：[github.com/itzhouq/grafana-mcp](https://github.com/itzhouq/grafana-mcp)（完整配置优先级与安全声明在 README）
- 工具落地页：[/tools/grafana-mcp](/tools/grafana-mcp)
- 搭档项目：[archery-mcp](https://github.com/itzhouq/archery-mcp)——一个看数据，一个看运行时；它的[接入教程](/blog/archery-mcp-tutorial)也写好了
