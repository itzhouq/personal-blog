/**
 * /dashboard 数据计算助手：公开数据（data/metrics.json，由 worklog/scripts/gen-dashboard.mjs 生成）的
 * 类型定义与口径计算。period=期间值（月收入、月 UV，累计=求和）；snapshot=快照值（粉丝、文章数，累计=最新值）。
 */

export type MetricKind = "money" | "count";
export type MetricMode = "period" | "snapshot";

export type MetricDef = {
  label: string;
  kind: MetricKind;
  mode: MetricMode;
  color: string;
};

export type LedgerPublic = {
  meta: {
    startedAt: string;
    goal: number;
    goalLabel: string;
    incomeNote: string;
    updatedAt: string;
  };
  metrics: Record<string, MetricDef>;
  entries: {
    month: string;
    values: Record<string, number | null>;
    note?: string;
  }[];
};

export function metricIds(data: LedgerPublic): string[] {
  return Object.keys(data.metrics);
}

export function idsOfKind(
  data: LedgerPublic,
  kind: MetricKind
): string[] {
  return metricIds(data).filter((id) => data.metrics[id].kind === kind);
}

/** 某指标截至第 idx 月的累计：period 求和，snapshot 取最近非空值 */
export function cumulativeOf(
  data: LedgerPublic,
  id: string,
  upToIdx: number
): number {
  const mode = data.metrics[id].mode;
  let acc = 0;
  for (let i = 0; i <= upToIdx; i++) {
    const v = data.entries[i].values[id];
    if (v == null) continue;
    if (mode === "period") acc += v;
    else acc = v;
  }
  return acc;
}

/** 某指标第 idx 月的展示值（snapshot 缺当月则回看最近非空） */
export function valueAt(
  data: LedgerPublic,
  id: string,
  idx: number
): number {
  const v = data.entries[idx]?.values[id];
  if (v != null) return v;
  if (data.metrics[id].mode !== "snapshot") return 0;
  for (let i = idx; i >= 0; i--) {
    const p = data.entries[i].values[id];
    if (p != null) return p;
  }
  return 0;
}

/** 环比变化量（period=当月-上月期间值；snapshot=当月-上月快照；首月返回 null） */
export function deltaOf(
  data: LedgerPublic,
  id: string,
  idx: number
): number | null {
  if (idx === 0) return null;
  return valueAt(data, id, idx) - valueAt(data, id, idx - 1);
}

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("zh-CN");
}

export function fmtMoney(n: number): string {
  return "¥" + fmtNum(n);
}
