/** 日期格式化：2026-10-06 -> 2026 年 10 月 06 日 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${y} 年 ${m} 月 ${d} 日`;
}

/** 中文按字数、英文按词数估算阅读时长 */
export function readingTime(text: string): string {
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const words = (
    text.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, " ").match(/[A-Za-z0-9_']+/g) || []
  ).length;
  const minutes = Math.max(1, Math.round(cjk / 380 + words / 200));
  return `${minutes} 分钟`;
}

/** 从标题提取年份用于分组 */
export function yearOf(date: string): string {
  return date.slice(0, 4);
}
