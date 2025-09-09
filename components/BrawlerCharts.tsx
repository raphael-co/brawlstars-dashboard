"use client";

import React from "react";
import { DACard } from "@/components/DACard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import T, { useI18n } from "@/components/T";

type RecentResult = {
  idx: number;
  result: "victory" | "defeat" | "draw" | string;
  mode: string;
};

type RecentDelta = {
  idx: number;
  delta: number;
  cumul: number;
  mode: string;
};

const YELLOW = "#FCD34D";
const AMBER = "#F59E0B";
const ORANGE = "#FB923C";
const BLUE = "#60A5FA";
const GRID = "rgba(255,255,255,0.12)";
const TEXT = "#FFFFFF";

const tooltipStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.6)",
  border: "1px solid #000",
  borderRadius: 10,
  color: "#fff",
  padding: "6px 8px",
  backdropFilter: "blur(4px)",
};

export default function BrawlerCharts({
  recentResults,
  recentDelta,
  periodLabel,
}: {
  recentResults: RecentResult[];
  recentDelta: RecentDelta[];
  periodLabel?: string;
}) {
  const { t } = useI18n();

  const resultData = recentResults.map((r) => ({
    x: r.idx,
    res: r.result === "victory" ? 1 : r.result === "defeat" ? -1 : 0,
    mode: r.mode,
    label: (r.result?.[0] ?? "-").toUpperCase(),
  }));

  const deltaData = recentDelta.map((d) => ({
    x: d.idx,
    delta: d.delta,
    cumul: d.cumul,
    mode: d.mode,
  }));

  const sampleLabel: React.ReactNode =
    periodLabel ?? (
      <>
        {" ("}
        {recentResults.length} <T k="charts.lastWithThisBrawler" />
        {")"}
      </>
    );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DACard innerClassName="p-4 sm:p-5">
        <div className="space-y-1">
          <div className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            <T k="charts.recentResults.title" /> {sampleLabel}
          </div>
          <div className="text-xs text-white/80">
            <T k="charts.recentResults.help" />
          </div>
        </div>

        <div style={{ width: "100%", height: 240 }} className="mt-2">
          <ResponsiveContainer>
            <BarChart data={resultData}>
              <defs>
                <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={YELLOW} />
                  <stop offset="100%" stopColor={ORANGE} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="x" stroke={TEXT} />
              <YAxis stroke={TEXT} domain={[-1, 1]} ticks={[-1, 0, 1]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: any, _n, p: any) => {
                  const v = Number(val);
                  const label =
                    v === 1
                      ? t("battlelog.victory")
                      : v === 0
                        ? t("battlelog.draw")
                        : t("battlelog.defeat");
                  return [label, `${t("charts.game")} #${p?.payload?.x}`];
                }}
              />
              <Bar
                dataKey="res"
                fill="url(#gradRes)"
                stroke="#000"
                strokeWidth={1.5}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="space-y-1">
          <div className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            <T k="charts.trophiesDelta.title" /> {sampleLabel}
          </div>
          <div className="text-xs text-white/80">
            <T k="charts.trophiesDelta.help" />
          </div>
        </div>

        <div style={{ width: "100%", height: 240 }} className="mt-2">
          <ResponsiveContainer>
            <AreaChart data={deltaData}>
              <defs>
                <linearGradient id="gradDelta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="gradCumul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AMBER} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={AMBER} stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="x" stroke={TEXT} />
              <YAxis stroke={TEXT} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: any, name: any, p: any) => {
                  const label =
                    name === "delta" ? t("charts.deltaLabel") : t("charts.cumulLabel");
                  return [val, `${label} — ${t("charts.game")} #${p?.payload?.x}`];
                }}
              />
              <Area
                dataKey="delta"
                type="monotone"
                stroke={BLUE}
                fill="url(#gradDelta)"
                strokeWidth={2.2}
                dot={false}
              />
              <Area
                dataKey="cumul"
                type="monotone"
                stroke={AMBER}
                fill="url(#gradCumul)"
                strokeWidth={2.2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DACard>
    </div>
  );
}
