# AdSense 启用步骤（personal-blog）

本站已做好全部代码侧准备，**默认关闭**。启用只差一个 ID。

## 代码侧现状（已完成，无需再动）

- `site.config.ts` → `adsense.clientId`：留空 = 全站零广告代码
- 填入后自动生效：布局挂 AdSense 加载器；每篇文章底部渲染一个自适应展示位（`components/AdSenseUnit.tsx`）
- 构建脚本 `scripts/gen-og.mjs` 会按 clientId 自动生成 `public/ads.txt`；留空则自动删除，不会留过期文件

## 启用步骤

1. **时点建议**：当前 got / batomon 的 AdSense 申请在审（2026-10-11 提交）。建议等这轮审核结果落地后再添加新站——审核期频繁变动站点有干扰风险。个人博客内容干净（技术+实盘，无灰产），通过概率不低。
2. AdSense 后台 → 网站 → 添加网站 → `itzhouq.cn`
3. 把分配的 `ca-pub-xxxxxxxx` 填进 `site.config.ts` 的 `adsense.clientId`
4. `npm run deploy`（构建脚本会自动生成 ads.txt 并上线广告代码）
5. 回后台点「验证 ads.txt」/「请求审核」

## 政策红线（本站尤其注意）

- 只在文章页投（当前实现即是）；首页/栏目页/工具页保持干净
- 文章内容不碰：盗版资源、破解分发、灰产工具——**账号级封禁会带走账号下全部站点**
- 公众号领取钩子（/wechat）不含诱导点击广告的设计，合规

## 已知取舍

- 广告位放在文章末尾（AdSenseUnit）而非文中穿插：对 BIP 调性最友好，CTR 略低。数据起来后可加 in-article 流体位（参考 ytzy 的做法：文中 1 个 + 文末 1 个）
- 未接自动广告（Auto Ads）：自动广告会全站插位，无法控制首页干净度
