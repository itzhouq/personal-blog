import type { Metadata } from "next";
import DashboardCharts, { type Series } from "@/components/DashboardCharts";
import {
  cumulativeOf,
  deltaOf,
  fmtMoney,
  fmtNum,
  idsOfKind,
  valueAt,
  type LedgerPublic,
} from "@/lib/dashboard";
import raw from "@/data/metrics.json";

export const metadata: Metadata = {
  title: "数据大盘",
  description:
    "Build in public 数据大盘：副业收入、流量、粉丝与内容积累的全部公开数据",
  alternates: { canonical: "/dashboard" },
};

const data = raw as LedgerPublic;
const lastIdx = data.entries.length - 1;
const months = data.entries.map((e) => e.month);
const latest = data.entries[lastIdx];

const moneyIds = idsOfKind(data, "money");
const countIds = idsOfKind(data, "count");

const incomeMonthly = months.map((_, i) =>
  moneyIds.reduce((s, id) => s + valueAt(data, id, i), 0)
);
let acc = 0;
const incomeCumulative = incomeMonthly.map((v) => (acc += v));

const growthSeries: Series[] = countIds.map((id) => ({
  name: data.metrics[id].label,
  color: data.metrics[id].color,
  data: months.map((_, i) => valueAt(data, id, i)),
}));

const totalIncome = incomeCumulative[lastIdx] ?? 0;
const goal = data.meta.goal || 50000;
const goalPct = Math.min(100, (totalIncome / goal) * 100);

export default function DashboardPage() {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">数据大盘</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        签名里说「流量和收入数据全部公开，失败了也发」——这里就是兑现承诺的地方。
        从 {data.meta.startedAt} 起算，每月初更新。
      </p>

      {/* 大数字卡片 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-[var(--muted)]">
            {data.meta.goalLabel || "累计收入"}（{data.meta.startedAt} 起算）
          </p>
          <p className="mt-1 text-3xl font-bold">{fmtMoney(totalIncome)}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            进度 {goalPct.toFixed(1)}% / 目标 {fmtMoney(goal)}
          </p>
        </div>
        {countIds.slice(0, 3).map((id) => {
          const cur = valueAt(data, id, lastIdx);
          const d = deltaOf(data, id, lastIdx);
          return (
            <div
              key={id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <p className="text-sm text-[var(--muted)]">
                {data.metrics[id].label}
              </p>
              <p className="mt-1 text-3xl font-bold">{fmtNum(cur)}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                {d == null
                  ? `截至 ${months[lastIdx]}`
                  : `较上月 ${d >= 0 ? "+" : "−"}${fmtNum(Math.abs(d))}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* 图表（客户端渲染，echarts 按需加载） */}
      <div className="mt-8">
        <DashboardCharts
          months={months}
          income={incomeMonthly}
          incomeCum={incomeCumulative}
          growth={growthSeries}
        />
      </div>

      {/* 最新快照表 */}
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold">最新快照 · {latest.month}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)]">
                <th className="py-2 pr-4 font-normal">指标</th>
                <th className="py-2 pr-4 text-right font-normal">当月</th>
                <th className="py-2 pr-4 text-right font-normal">累计</th>
                <th className="py-2 text-right font-normal">环比</th>
              </tr>
            </thead>
            <tbody>
              {metricRows().map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)]">
                  <td className="py-2.5 pr-4">{row.label}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {row.cur}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {row.cum}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {latest.note && (
          <p className="mt-4 text-sm text-[var(--muted)]">本月备注：{latest.note}</p>
        )}
      </div>

      {/* 边界声明 */}
      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        边界说明：收入为实际到账口径（{data.meta.incomeNote}）；订单明细、渠道构成与选题方向等竞敏信息延迟公开，
        跑出结果后会在复盘中披露。数据每月初更新，截至 {data.meta.updatedAt}。
      </p>
    </div>
  );

  function metricRows() {
    return [...moneyIds, ...countIds].map((id) => {
      const m = data.metrics[id];
      const cur = valueAt(data, id, lastIdx);
      const cum = cumulativeOf(data, id, lastIdx);
      const d = deltaOf(data, id, lastIdx);
      const f = (n: number) => (m.kind === "money" ? fmtMoney(n) : fmtNum(n));
      return {
        id,
        label: m.label,
        cur: f(cur),
        cum: m.mode === "period" ? f(cum) : "—",
        delta:
          d == null ? "—" : d === 0 ? "±0" : `${d > 0 ? "+" : "−"}${f(Math.abs(d))}`,
      };
    });
  }
}
