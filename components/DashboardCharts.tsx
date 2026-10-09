"use client";

/**
 * 数据大盘图表（客户端渲染，静态导出兼容）
 * echarts 按需引入 + useEffect 内动态 import，避免 SSR 预渲染触达；
 * 只在 /dashboard 一个页面进 bundle，不影响其他页面体积。
 * 博客切换明暗主题时（html class 变化）整体重渲染。
 */
import { useEffect, useRef } from "react";

export type Series = { name: string; color: string; data: (number | null)[] };

export default function DashboardCharts({
  months,
  income,
  incomeCum,
  growth,
}: {
  months: string[];
  income: (number | null)[];
  incomeCum: number[];
  growth: Series[];
}) {
  const incomeRef = useRef<HTMLDivElement>(null);
  const growthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    const instances: { resize: () => void; dispose: () => void }[] = [];
    let observer: MutationObserver | null = null;

    const isDark = () => document.documentElement.classList.contains("dark");

    async function render() {
      const [core, charts, comps, renderers] = await Promise.all([
        import("echarts/core"),
        import("echarts/charts"),
        import("echarts/components"),
        import("echarts/renderers"),
      ]);
      core.use([
        charts.BarChart,
        charts.LineChart,
        comps.GridComponent,
        comps.TooltipComponent,
        comps.LegendComponent,
        renderers.CanvasRenderer,
      ]);
      if (disposed) return;

      const dark = isDark();
      const axis = {
        color: dark ? "#a8a29e" : "#78716c",
        fontSize: 11,
      };
      const split = { lineStyle: { color: dark ? "#292524" : "#e7e5e4" } };
      const grid = { left: 8, right: 8, top: 32, bottom: 8, containLabel: true };

      const mk = (el: HTMLElement | null) => {
        if (!el) return null;
        const c = core.init(el, dark ? "dark" : undefined);
        instances.push(c);
        return c;
      };

      mk(incomeRef.current)?.setOption({
        backgroundColor: "transparent",
        tooltip: { trigger: "axis" },
        legend: { top: 0, textStyle: axis, data: ["当月收入", "累计"] },
        grid,
        xAxis: { type: "category", data: months, axisLabel: axis },
        yAxis: {
          type: "value",
          axisLabel: { ...axis, formatter: (v: number) => "¥" + v },
          splitLine: split,
        },
        series: [
          {
            name: "当月收入",
            type: "bar",
            data: income,
            itemStyle: { color: "#d85a30", borderRadius: [3, 3, 0, 0] },
            barMaxWidth: 28,
          },
          {
            name: "累计",
            type: "line",
            data: incomeCum,
            itemStyle: { color: "#534ab7" },
            smooth: true,
          },
        ],
      });

      mk(growthRef.current)?.setOption({
        backgroundColor: "transparent",
        tooltip: { trigger: "axis" },
        legend: { top: 0, textStyle: axis },
        grid,
        xAxis: { type: "category", data: months, axisLabel: axis },
        yAxis: { type: "value", axisLabel: axis, splitLine: split },
        series: growth.map((s) => ({
          name: s.name,
          type: "line",
          data: s.data,
          itemStyle: { color: s.color },
          smooth: true,
          connectNulls: true,
        })),
      });
    }

    function rerender() {
      instances.forEach((c) => c.dispose());
      instances.length = 0;
      render().catch(() => {});
    }

    rerender();

    observer = new MutationObserver(() => rerender());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onResize = () => instances.forEach((c) => c.resize());
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      instances.forEach((c) => c.dispose());
    };
  }, [months, income, incomeCum, growth]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold">收入时间线</h2>
        <div ref={incomeRef} className="mt-2 h-[280px] w-full" />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold">积累曲线</h2>
        <div ref={growthRef} className="mt-2 h-[280px] w-full" />
      </div>
    </div>
  );
}
