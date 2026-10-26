---
title: 十分钟给 Claude Code 装上「生产库只读眼」：archery-mcp 接入教程
date: 2026-10-26
tags: [MCP, AI, 数据库, 教程]
summary: 上一篇讲了 archery-mcp 为什么这么设计，这篇只讲怎么用：从安装到在 Claude Code 里跑通第一条只读查询、第一次 SQL 上线预检，十分钟够。配置项以仓库 README 为准，这里给的是能直接抄的骨架。
column: tutorial
---

上一篇[开源复盘](/blog/archery-mcp-open-source)聊了 archery-mcp 的设计取舍，后台收到最多的问题是"怎么接"。这篇就是那篇的实操篇——不含原理，照着做就行。

## 前置条件

- 你在用 [Archery](https://github.com/hkadb/archery) 管理 SQL 查询和上线工单（这个 MCP 是 Archery 的外壳，没有 Archery 就没有意义）
- 本机有 Python 环境；AI 客户端用 Claude Code、Cursor 或其他支持 MCP 的都行

## 安装

不用 clone 仓库，直接跑：

```bash
# 方式一：uvx（推荐，免安装）
uvx archery-mcp

# 方式二：pip
pip install archery-mcp
```

## 配置 MCP 客户端

在 Claude Code 里 `claude mcp add`，或直接写配置文件。骨架长这样（**具体环境变量名以仓库 README 为准**）：

```json
{
  "mcpServers": {
    "archery": {
      "command": "uvx",
      "args": ["archery-mcp"],
      "env": {
        "ARCHERY_URL": "https://archery.你的域名.com",
        "ARCHERY_TOKEN": "你的个人 API Token"
      }
    }
  }
}
```

两个要点：

1. **凭据是你个人的 Archery 账号 Token**，不是数据库密码。权限跟着账号走：你能查哪些库、返回多少行、哪些字段脱敏，全部由 Archery 平台说了算，AI 拿不到任何越权能力。
2. **查询目标（实例/数据库/模式）在服务端锁定**，启动时用环境变量固定。想让 AI 看别的库？改配置重启，别想运行时切。

## 五个工具，各自什么时候用

| 工具 | 场景 |
|---|---|
| `list_tables` | "这个库里有哪些表"——写任何 SQL 前先看一眼 |
| `describe_table` | "xx 表的真实结构和索引"——AI 写迁移脚本的依据 |
| `query` | 抽样看数据特征，清洗脚本不用再猜 |
| `query_history` | 翻历史查询，找回上次写过的那段 SQL |
| `sql_check` | 上线前预检，SELECT 驳回、UPDATE/DELETE 必须带 WHERE |

## 一次真实的工作流

配置好之后，版本迭代的写法就变了。你可以直接这样说：

> 给订单表加一个 refund_status 字段并写迁移脚本，先用 archery 看下生产环境的真实表结构，写完自己过一遍 sql_check。

AI 会自己调 `describe_table` 确认生产结构 → 生成 DDL → 调 `sql_check` 预检 → 驳回项自己改到通过。你人工过目后再提交 Archery 工单走审批。人肉比对环境差异这一步，从此消失。

## 常见问题

**会改我的数据吗？** 不会。全部工具只读，写操作唯一的入口是 `sql_check`——而它只做检查，不执行。

**数据会脱敏吗？** 脱敏规则配置在 Archery 平台侧，返回给 AI 的数据已经过了你账号权限下的脱敏管道。

**仓库在哪？** [github.com/itzhouq/archery-mcp](https://github.com/itzhouq/archery-mcp)，MIT 协议，环境变量清单和声明全在 README。有问题提 Issue，比我快。

## 相关链接

- 设计取舍复盘：[让 AI 只读"看见"生产库：archery-mcp 开源复盘](/blog/archery-mcp-open-source)
- 工具落地页：[/tools/archery-mcp](/tools/archery-mcp)
- 搭档项目：[grafana-mcp](https://github.com/itzhouq/grafana-mcp)——archery 管"看数据"，grafana 管"看运行时"
