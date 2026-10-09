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
    { href: "/tags", label: "标签" },
    { href: "/tools", label: "工具" },
    { href: "/about", label: "关于" },
  ],
  /** 首页"正在构建"路线图（build in public 展示） */
  roadmap: [
    { text: "个人博客网站（本站）", done: true },
    { text: "每周一篇 build in public 记录", done: false },
    { text: "第一个挂载的小工具（AI Chat 游乐场）", done: true },
  ],
  /** /tools 页面卡片：后续挂自己的小工具、商店入口 */
  tools: [
    {
      title: "在线工具箱",
      desc: "14 个纯前端小工具：图片压缩/裁剪/水印、GIF 合成、违禁词检测、JWT 解析……全部在浏览器本地运行，数据不上传",
      href: "https://tools.itzhouq.cn",
      badge: "可用",
    },
    {
      title: "AI Chat 游乐场",
      desc: "在线体验大模型对话：填入任意 OpenAI 兼容端点 + Key 即可，支持流式输出与多轮对话",
      href: "/tools/chat",
      badge: "可用",
    },
    {
      title: "Archery MCP",
      desc: "开源的 Archery MCP Server：让 AI 编码助手只读接入生产库查表结构、检查上线 SQL，嵌入日常开发工作流",
      href: "https://github.com/itzhouq/archery-mcp",
      badge: "开源",
    },
    {
      title: "Grafana MCP",
      desc: "开源的 Grafana MCP Server：让 AI 编码时直接读 test/prod 的 Loki 日志、Prometheus 指标与 Tempo 链路，双环境一键切换",
      href: "https://github.com/itzhouq/grafana-mcp",
      badge: "开源",
    },
    {
      title: "更多小工具",
      desc: "文案助手 / 文档问答 / 效率小脚本……",
      href: "",
      badge: "征集想法",
    },
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
  },
};
