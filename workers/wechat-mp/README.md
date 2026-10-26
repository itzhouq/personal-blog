# wechat-mp Worker：公众号关键词自动回复 + 工具包下载

公众号「搞副业的老周itzhouq」的被动回复服务。用户在公众号后台回复关键词（如「出海」），
机器人秒回《出海自动化工具包》下载链接；链接指向本 Worker assets 里的 `kit.zip`。

## 文件

- `index.js` —— Worker 本体（签名校验 / 关键词回复 / 被动回复 XML）
- `wrangler.toml` —— 配置（自定义域名 mp.itzhouq.cn + assets 目录）
- `assets/kit.zip` —— 工具包，由 `npm run kit` 生成，**不入 git**

## 一次性配置（需要公众号管理员操作）

1. 生成一个 Token（任意随机字符串），然后：

   ```bash
   echo "你的Token" | npx wrangler secret put MP_TOKEN -c workers/wechat-mp/wrangler.toml
   npx wrangler deploy -c workers/wechat-mp/wrangler.toml   # 或仓库根目录 npm run deploy:mp
   ```

2. **微信开发者平台**（2026-07 起开发接口管理已从公众平台迁出，旧路径「设置与开发 → 基本配置」作废）：
   微信扫码登录 <https://developers.weixin.qq.com/platform> → 「我的业务」→「公众号」→ 基础信息 → **「域名与消息推送配置」**：
   - 消息推送 URL 填 `https://mp.itzhouq.cn/wechat`
   - Token 填上一步同一个字符串
   - EncodingAESKey 随机生成即可，消息加解密方式选「明文模式」
   - 启用消息推送——微信会来校验 echostr，Worker 的 GET 分支会自动通过
   - 启用后公众号后台设置的自动回复和自定义菜单即失效（官方文档原文）；以后若调 API（access_token），IP 白名单也在此平台维护（不加会报 40164）

3. 微信里给公众号发「出海」，应收到下载链接即成功。

## 注意

- **个人未认证订阅号的能力边界**：可以用服务器配置 + **被动回复**（本 Worker 的全部用法）；回复须在 15 秒内返回（本 Worker 即时回文本，无压力）。用不了的：客服消息、模板/订阅通知、网页授权 OAuth、JS-SDK 高级能力——都需认证，本场景不依赖。
- **启用服务器配置后，公众号所有消息都会先到这个 Worker**，后台的「自动回复」规则失效；
  关键词菜单在 `index.js` 的 `replyFor()` 里改。
- `mp.itzhouq.cn` 是 workers 自定义域名，首次部署时 Cloudflare 会自动创建 DNS 记录（需要 zone 权限）。
- 被动回复有 5 秒超时（微信侧重试 3 次），重文案/重逻辑不要放进来；被动回复也拿不到用户头像等隐私，天然安全。
