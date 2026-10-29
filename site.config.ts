/**
 * 站点全局配置：改这一处即可完成个性化
 * TODO: 上线前替换 name / author / siteUrl / social / email
 */
export const site = {
  /** 站点名（页面标题后缀、页脚） */
  name: "搞副业的老周itzhouq",
  /** 首页浏览器标签标题 */
  title: "搞副业的老周itzhouq · Build in Public",
  /** SEO 描述 */
  description: "记录独立开发、AI 工具与副业探索的 Build in Public 日常",
  author: "搞副业的老周itzhouq",
  email: "zhouq218@gmail.com",
  /** 部署后的真实域名（影响 sitemap/RSS/OG 链接）；绑自定义域名后替换 */
  siteUrl: "https://itzhouq.cn",
  locale: "zh-CN",
  social: {
    github: "https://github.com/itzhouq",
    x: "https://x.com/itzhouq2026",
    /** 本站源码仓库（页脚外链） */
    repo: "https://github.com/itzhouq/personal-blog",
  },
  /** 微信生态：公众号 + 个人微信号（物料图在 public/wechat/） */
  wechat: {
    /** 公众号名称（微信搜一搜可搜到） */
    officialAccount: "搞副业的老周itzhouq",
    /** 公众号「搜一搜」搜索框横幅 */
    searchBanner: "/wechat/gzh-search-banner.webp",
    /** 公众号扫码 + 搜一搜联合物料（含二维码） */
    scanSearchBanner: "/wechat/gzh-scan-search.webp",
    /** 个人微信号二维码（正方形，裁剪自官方名片图） */
    contactQr: "/wechat/wechat-contact-qr-square.png",
    /** 个人微信号完整名片图（竖版长图） */
    contactCard: "/wechat/wechat-contact-qrcode.png",
  },
  nav: [
    { href: "/", label: "首页" },
    { href: "/blog", label: "文章" },
    { href: "/columns", label: "栏目" },
    { href: "/tags", label: "标签" },
    { href: "/tools", label: "工具" },
    { href: "/dashboard", label: "数据" },
    { href: "/about", label: "关于" },
  ],
  /**
   * 内容栏目：文章 frontmatter 里写 column: <key> 即归入对应栏目。
   * 未写 column 的文章只在「文章」总列表出现，不进栏目页。
   */
  columns: [
    {
      key: "practice",
      name: "实操复盘",
      description: "Build in Public 的第一现场：做了什么、数据怎么样、赚没赚到钱，失败了也发。",
    },
    {
      key: "tutorial",
      name: "工具教程",
      description: "自研工具与日常工作流的实操教程：装上就能用，每一步都是真实跑通的。",
    },
    {
      key: "opensource",
      name: "开源项目",
      description: "开源的 MCP Server 与效率工具：设计取舍、脱敏复盘和使用方式。",
    },
    {
      key: "infra",
      name: "白嫖与部署",
      description: "Cloudflare 免费全家桶、自托管与独立开发者基建：不买服务器，把成本压到零。",
    },
  ],
  /**
   * 连载系列：文章 frontmatter 里写 series: <key> + seriesOrder: <n>。
   * 系列页自动按 seriesOrder 排序，显示「已更 X 期」。
   */
  series: [
    {
      key: "cf-free",
      name: "独立开发穷鬼套餐",
      description:
        "把独立开发的部署成本压到 0 元：Cloudflare 免费全家桶系列，从地图到实操，每周五更新。",
    },
  ],
  /**
   * /tools 页面卡片 + 工具落地页（/tools/<slug>）。
   * 有 slug 的条目自动生成独立落地页；tutorial 指向对应教程文的 slug。
   */
  tools: [
    {
      slug: "web-tools",
      title: "在线工具箱",
      desc: "14 个纯前端小工具：图片压缩/裁剪/水印、GIF 合成、违禁词检测、JWT 解析……全部在浏览器本地运行，数据不上传",
      href: "https://tools.itzhouq.cn",
      badge: "可用",
      tutorial: "web-tools-launch",
      points: [
        "14 个工具全部纯前端运行，数据不出浏览器",
        "每个工具一个子域名（json. / qr. / gzh. ……），Cloudflare Worker 分流",
        "违禁词检测、JWT 解析等中文场景工具，开发者日常刚需",
      ],
    },
    {
      slug: "ai-chat",
      title: "AI Chat 游乐场",
      desc: "在线体验大模型对话：填入任意 OpenAI 兼容端点 + Key 即可，支持流式输出与多轮对话",
      href: "/tools/chat",
      badge: "可用",
      points: [
        "OpenAI 兼容端点通吃，自带 Key 即开即用",
        "流式输出 + 多轮对话，纯前端实现",
        "Key 只存本地浏览器，服务端不经手",
      ],
    },
    {
      title: "置业账本",
      desc: "江浙沪买房决策工作台：官方核验的房价指数与政策追踪、租买现金流测算、关注楼盘本地跟踪与持有成本分析——隐私数据只存自己浏览器，不上传",
      href: "https://housing.itzhouq.cn",
      badge: "可用",
    },
    {
      slug: "archery-mcp",
      title: "Archery MCP",
      desc: "开源的 Archery MCP Server：让 AI 编码助手只读接入生产库查表结构、检查上线 SQL，嵌入日常开发工作流",
      href: "https://github.com/itzhouq/archery-mcp",
      badge: "开源",
      tutorial: "archery-mcp-tutorial",
      repo: "https://github.com/itzhouq/archery-mcp",
      points: [
        "查询目标在服务端锁定，权限/审计/脱敏全部复用 Archery 平台",
        "sql_check 双路检查：本地静态规范 + 平台检查，上线前 AI 自检",
        "pip install archery-mcp 或 uvx archery-mcp 即装即用，MIT 协议",
      ],
    },
    {
      slug: "grafana-mcp",
      title: "Grafana MCP",
      desc: "开源的 Grafana MCP Server：让 AI 编码时直接读 test/prod 的 Loki 日志、Prometheus 指标与 Tempo 链路，双环境一键切换",
      href: "https://github.com/itzhouq/grafana-mcp",
      badge: "开源",
      repo: "https://github.com/itzhouq/grafana-mcp",
      points: [
        "10 个只读工具：Loki 日志 / Prometheus 指标 / Tempo 链路 / 告警",
        ".grafana.json 项目上下文，agent 一次对齐 app 与环境",
        "零依赖单文件 TypeScript，bun 直接运行",
      ],
    },
    {
      slug: "gzh-cover",
      title: "公众号封面生成器",
      desc: "公众号首图/次图/小红书三套尺寸、八套配色，Canvas 所见即所得，3 倍分辨率导出——导出的图按 slug 命名，发布器自动取用",
      href: "https://gzh.itzhouq.cn",
      badge: "可用",
      points: [
        "三套尺寸：公众号首图 2.35:1、次图 1:1、小红书 3:4",
        "八套配色（含两个深色），中文排版逐字符换行、英文按词不断行",
        "导出图按文章 slug 命名，发布链路自动取用——约定优于配置",
      ],
    },
    {
      slug: "site-ops-dashboard",
      title: "站况面板",
      desc: "给自己钉的一面「站况墙」：哪个站该喂了、哪个活要过期，每天开工扫一眼。Glance + 一份 markdown 账本，账本只有一本，墙只是投影",
      href: "",
      badge: "自用",
      tutorial: "site-ops-dashboard-tutorial",
      points: [
        "「该干嘛」排第一屏：最久没动的站排最前，超期变红",
        "点名字直达站点后台，快过期的活单独倒计时",
        "账本只有一本（markdown），面板只读投影，15 分钟自动对齐",
      ],
    },
    {
      title: "更多小工具",
      desc: "文案助手 / 文档问答 / 效率小脚本……",
      href: "",
      badge: "征集想法",
    },
  ],
  /** 首页「最新发布」横幅（build in public 外链位）：当前主推产品 */
  launch: {
    url: "https://voicewove.com",
    title: "Voicewove",
    tagline: "AI 文字转语音 + 声音克隆",
    hook: "40+ 语言的 AI 语音合成与声音克隆，从 fork 开源项目到收到第一笔真实付款，只用了 5 天。",
    postSlug: "voicewove-fork-to-live",
  },
  /**
   * 公众号领取钩子：站内 CTA + /wechat 领取页 + Worker 关键词自动回复。
   * Worker 部署与配置见 workers/wechat-mp/README.md。
   */
  leadMagnet: {
    /** 公众号回复的关键词 */
    keyword: "出海",
    /** 领取物名称 */
    packageName: "《出海自动化工具包》",
    /** 下载文件名（Worker assets 里对应 kit.zip） */
    downloadFile: "kit.zip",
    /** 打包进工具包的内容清单（展示用，实际打包见 scripts/build-lead-package.mjs） */
    items: [
      "GSC 收录加速 skill——发布即提交，新页面收录不干等",
      "GSC 数据导出 skill——搜索表现数据一条命令拉回本地台账",
      "Adsterra 接入 skill——广告位接入与收益回填的完整流程",
      "Cloudflare Web Analytics 接入 skill——免费统计零维护接入",
      "出海自查清单——域名/托管/统计/变现四步检查表",
    ],
  },
  /**
   * Google AdSense：填入 ca-pub-xxxx 客户端 ID 即全站生效
   * （文章页自动出现广告位 + 自动生成 public/ads.txt）。留空 = 完全不渲染任何广告代码。
   * 启用步骤与时点建议见 docs/adsense-setup.md。
   */
  adsense: {
    clientId: "",
  },
  /** 首页"正在构建"路线图（build in public 展示） */
  roadmap: [
    { text: "个人博客网站（本站）", done: true },
    { text: "每周一篇 build in public 记录", done: false },
    { text: "第一个挂载的小工具（AI Chat 游乐场）", done: true },
    { text: "内容栏目化 + 连载系列页", done: true },
  ],
  /** giscus 评论：基于仓库 Discussions，giscus App 安装到仓库后自动生效 */
  giscus: {
    repo: "itzhouq/personal-blog",
    repoId: "R_kgDOU-SsIQ",
    category: "Announcements",
    categoryId: "DIC_kwDOU-SsIc4DHLjn",
  },
  /** umami 统计：填入自托管地址与 website id 后自动开启 */
  analytics: {
    umamiSrc: "",
    umamiId: "",
    /** Cloudflare Web Analytics beacon token（CF Dashboard → Web Analytics → 管理 JS 片段）；留空=关闭 */
    cfBeaconToken: "",
  },
};

/** 类型辅助：栏目 / 系列定义 */
export type ColumnDef = (typeof site.columns)[number];
export type SeriesDef = (typeof site.series)[number];
export type ToolDef = (typeof site.tools)[number];
