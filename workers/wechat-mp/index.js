/**
 * 公众号被动回复 + 工具包下载 Worker。
 *
 * 路由：
 *   /kit.zip 等静态文件 —— 由 [assets] 目录直接服务（assets 优先于 worker）。
 *   /wechat —— 微信公众号服务器配置的 URL：
 *     GET  请求 = 后台「启用配置」时的 echostr 签名校验
 *     POST 请求 = 用户消息，按关键词被动回复
 *
 * 配置步骤见同目录 README.md；MP_TOKEN 是与公众号后台一致的自定义 Token（secret）。
 */

const API_BASE = "https://itzhouq.cn";

/** 关键词 → 回复文案。改文案只动这里。 */
function replyFor(keyword, env) {
  const kitUrl = `${env.MP_PUBLIC_BASE}/kit.zip`;
  switch (keyword) {
    case "出海":
      return (
        `📦《出海自动化工具包》已备好，点此下载：\n${kitUrl}\n\n` +
        `包含：GSC 收录加速 / GSC 数据导出 / Adsterra 接入 / CF 统计接入 四个自动化 skill，加一份出海自查清单。\n` +
        `解压后把 SKILL.md 丢给任意 AI 编码助手即可按说明执行。更新后重发「出海」拿最新版。`
      );
    case "工具":
      return `🧰 老周的工具箱全集在这里：\n${API_BASE}/tools\n\n全部纯前端、免费无广告，浏览器里直接用。`;
    case "微信":
      return `👋 加老周微信：在 ${API_BASE}/about 页面有我的个人微信二维码，备注「公众号」来就好。`;
    default:
      return (
        `收到！我是老周的自动回复机器人 🤖\n\n` +
        `试试这些关键词：\n` +
        `· 回复「出海」领《出海自动化工具包》\n` +
        `· 回复「工具」拿工具箱地址\n` +
        `· 回复「微信」加我个人微信\n\n` +
        `其他留言老周会在后台看到，抽空回复你。`
      );
  }
}

/** 公众号签名：token/timestamp/nonce 排序后 sha1 */
async function verifySignature(url, token) {
  const u = new URL(url);
  const signature = u.searchParams.get("signature") ?? "";
  const timestamp = u.searchParams.get("timestamp") ?? "";
  const nonce = u.searchParams.get("nonce") ?? "";
  const plain = [token, timestamp, nonce].sort().join("");
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(plain));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
}

function xmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`));
  return m ? (m[1] ?? m[2] ?? "") : "";
}

function textReply(to, from, content) {
  return (
    `<xml>` +
    `<ToUserName><![CDATA[${to}]]></ToUserName>` +
    `<FromUserName><![CDATA[${from}]]></FromUserName>` +
    `<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>` +
    `<MsgType><![CDATA[text]]></MsgType>` +
    `<Content><![CDATA[${content}]]></Content>` +
    `</xml>`
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/wechat") {
      return new Response("Not found", { status: 404 });
    }

    if (!(await verifySignature(request.url, env.MP_TOKEN))) {
      return new Response("bad signature", { status: 403 });
    }

    // 「启用服务器配置」时的握手校验
    const echostr = url.searchParams.get("echostr");
    if (request.method === "GET") {
      return new Response(echostr ?? "", { headers: { "content-type": "text/plain" } });
    }

    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    const xml = await request.text();
    const msgType = xmlValue(xml, "MsgType");
    const fromUser = xmlValue(xml, "FromUserName");
    const toUser = xmlValue(xml, "ToUserName");

    // 只处理文本消息；事件（关注/取关）等不回复
    if (msgType !== "text") {
      return new Response("success");
    }

    const keyword = xmlValue(xml, "Content").trim();
    const reply = replyFor(keyword, env);
    return new Response(textReply(fromUser, toUser, reply), {
      headers: { "content-type": "text/xml; charset=utf-8" },
    });
  },
};
