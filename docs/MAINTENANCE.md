# 博客维护手册（唯一入口）

> 所有例行维护看这一份就够。细节文档按指针跳转；改完本手册相关部分记得同步更新指向的文件。

## 一、节奏总览

| 频率 | 动作 | 工具/文件 |
|---|---|---|
| 每周 1 篇 | 发文（周五穷鬼套餐系列 / 周三复盘·教程交替） | `docs/editorial-calendar.md` |
| 每周 | 发布后 GSC 请求收录（≤6 条/批） | `gsc-request-indexing` skill |
| 每月初 | 拉 PV/UV 回填台账，重新生成大盘 | `worklog/scripts/pull-cf-analytics.mjs` → `gen-dashboard.mjs` |
| 每月 1 号 | 滚动排期：勾掉已发、顶上待发草稿、填下月槽位 | `docs/editorial-calendar.md` |
| 每周（自动） | Adsterra 收益回填台账 | `worklog/scripts/pull-adsterra-revenue.mjs`（已自动化） |
| 季度 | 过审体检/被拒复查（AdSense 启用后） | `docs/adsense-setup.md` |

## 二、周更发文流水线（标准动作）

1. **选题**：热词池/系列排期/待转正草稿三选一（排期表为准），先确认有搜索量再动笔
2. **写作**：frontmatter 必填 `title / date / tags / summary`，加 `column`（四栏目之一）；
   属于连载的加 `series: cf-free` + `seriesOrder: <n>`
3. **内链纪律**：只链已发布文章（**draft 禁链**）；新文至少链 2 篇旧文
4. **构建验证**：`npm run build`（prebuild 自动生成 OG 图和 ads.txt）
5. **部署**：`npm run deploy`（= build + wrangler pages deploy）
6. **提交**：**当次发文当次 commit + push**（多会话同仓的教训：不过夜）
7. **GSC**：新 URL 请求编入索引（单批 ≤6，配额超限按 CSV 协议次日恢复）

## 三、公众号钩子维护（重点）

当前结构：**一个关键词「出海」→ 一份会持续变厚的工具包**（`workers/wechat-mp/`）。

### 日常：更新工具包内容（最常见，三步）

1. 改内容：skill 源在 `../agent-skills/` 对应目录，或 `scripts/kit-assets/出海自查清单.md`
2. 重打包：`npm run kit`（自动做密钥扫描——命中即中止，这是红线不是建议）
3. 重发 Worker：`npm run deploy:mp`

回复文案不用动（「出海」永远指向最新的 kit.zip，版本自增）。

### 加新关键词/新下载资料的通用步骤（当前实现下约 5 行）

1. 文件放进 `workers/wechat-mp/assets/`（如 `seo-kit.zip`）
2. 在 `workers/wechat-mp/index.js` 的 `replyFor()` 加一个 `case "新关键词"` 返回 `${env.MP_PUBLIC_BASE}/文件名`
3. （可选）`site.config.ts` 的 `leadMagnet` 只描述主钩子；新资料在 `/wechat` 领取页的清单里补一行
4. `npm run deploy:mp`

**维护原则：先问能不能不加关键词。** 每个关键词都是一份「要长期保鲜」的承诺——能塞进现有工具包的就加进包里（改 kit 内容即可，零代码）；只有当新产品线明显不同（比如游戏站工具 vs 出海工具）才开新关键词。关键词超过 3 个时再考虑配置化（manifest.json 驱动回复），目前不预建。

### 注意事项

- 微信后台的自动回复/自定义菜单已失效（服务器配置互斥），关键词菜单全在 `replyFor()` 里
- 被动回复 15 秒内必须返回；回复文案改 `replyFor()`，重逻辑别放这里
- Token 在 `~/.keys/wechat-mp-token.txt`（与开发者平台配置一致），**永不入仓**

## 四、数据与口径

- **PV/UV**：零埋点方案，来自 CF Zone Analytics（整 zone 口径，含 tools.itzhouq.cn）
  → 每月初 `pull-cf-analytics.mjs` 写 `worklog/journal/ledger.json` → `gen-dashboard.mjs` 生成 `data/metrics.json` → `/dashboard` 渲染
- **口径备忘**：UV 是 zone 级 IP 近似去重（偏大、看趋势）；1d 数据小时级延迟，月初拉上月最准
- **收入**：Adsterra 周更自动回填同一 ledger；AdSense 启用后加一条 pull 通道即可

## 五、红线清单（每次改动过一遍）

- [ ] 密钥/Token 不入仓（`.gitignore` 已挡 `public/ads.txt`、`public/og`、`workers/wechat-mp/assets`、`seo-reports`）
- [ ] draft 文章不被内链引用
- [ ] 广告（AdSense 启用后）只投文章页，首页/栏目页保持干净
- [ ] 内容不碰盗版/破解/灰产——账号级风险
- [ ] 打包工具包前密钥扫描必须通过（`npm run kit` 自动执行）

## 六、指针

- 排期与选题池：`docs/editorial-calendar.md`
- AdSense 启用步骤与时点：`docs/adsense-setup.md`
- Worker 部署与微信后台配置：`workers/wechat-mp/README.md`
- 站况面板数据计算逻辑：`lib/dashboard.ts`
