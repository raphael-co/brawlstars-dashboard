"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Palette DA Brawl
const YELLOW = "#FCD34D"; // yellow-300
const AMBER  = "#F59E0B"; // amber-500
const ORANGE = "#FB923C"; // orange-400
const BLUE   = "#60A5FA"; // sky-400-ish
const PINK   = "#F0ABFC"; // fuchsia-300-ish
const GRID   = "rgba(255,255,255,0.12)";
const TEXT   = "#FFFFFF";

const tooltipStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.6)",
  border: "1px solid #000",
  borderRadius: 10,
  color: "#fff",
  padding: "6px 8px",
  backdropFilter: "blur(4px)",
};

// ---- Petite étiquette descriptive (DA Brawl) ----
function ChartDesc({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] leading-relaxed text-white/85 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
      <span className="inline-flex items-center gap-1 rounded-md border-2 border-black bg-gradient-to-b from-yellow-300/70 to-amber-400/70 px-1.5 py-0.5 text-[10px] font-extrabold text-black shadow-[0_2px_0_#000] mr-2">
        TIP
      </span>
      {children}
    </p>
  );
}

// ---- Sous-titre période ----
function PeriodBadge({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <div className="text-xs text-white/75">
      Période&nbsp;: <span className="font-semibold text-yellow-300">{label}</span>
    </div>
  );
}

// ====== Charts existants ======

export function TrophiesArea({
  data,
  periodLabel,
}: {
  data: Array<{ x: string; y: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Progression des trophées
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Évolution de vos trophées au fil du temps. La zone colorée met en avant la dynamique récente.
      </ChartDesc>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={YELLOW} stopOpacity={0.9} />
                <stop offset="100%" stopColor={AMBER}  stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="x" stroke={TEXT} />
            <YAxis stroke={TEXT} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area dataKey="y" type="monotone" stroke={YELLOW} fill="url(#gradArea)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WinrateBars({
  data,
  periodLabel,
}: {
  data: Array<{ mode: string; winrate: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Winrate par mode
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Pourcentage de victoires par mode sur la période. 100% = toutes les parties gagnées sur ce mode.
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={YELLOW} />
                <stop offset="100%" stopColor={ORANGE} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="mode" stroke={TEXT} />
            <YAxis stroke={TEXT} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="winrate" fill="url(#gradBar)" stroke="#000" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ModeVolumeBars({
  data,
  periodLabel,
}: {
  data: Array<{ mode: string; total: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Volume de parties par mode
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Répartition du nombre de parties jouées par mode. Utile pour contextualiser vos winrates (taille d’échantillon).
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="mode" stroke={TEXT} />
            <YAxis stroke={TEXT} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="total" fill={BLUE} stroke="#000" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ResultsPie({
  data,
  periodLabel,
}: {
  data: Array<{ name: string; value: number; key: 'victory' | 'defeat' | 'draw' }>;
  periodLabel?: string;
}) {
  const COLORS = { victory: YELLOW, defeat: "#EF4444", draw: PINK } as const;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Répartition des résultats
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Vue d’ensemble de vos victoires, défaites et nuls sur la période affichée.
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} stroke="#000" strokeWidth={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.key]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RollingWinrateLine({
  data,
  periodLabel,
}: {
  data: Array<{ idx: number; wr: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Winrate cumulée par partie
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Tendance de performance : à chaque match, la courbe montre le pourcentage total de victoires jusqu’à cet instant.
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="idx" stroke={TEXT} />
            <YAxis stroke={TEXT} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="wr" stroke={AMBER} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DurationHistogram({
  data,
  periodLabel,
}: {
  data: number[];
  periodLabel?: string;
}) {
  const bins = [
    { label: "≤60s",   min: 0,   max: 60 },
    { label: "61-90s", min: 61,  max: 90 },
    { label: "91-120s",min: 91,  max: 120 },
    { label: "121-150s",min: 121,max: 150 },
    { label: "151-180s",min: 151,max: 180 },
    { label: "180+s",  min: 181, max: Infinity },
  ];
  const counts = bins.map(b => ({
    bucket: b.label,
    count: data.filter(d => d >= b.min && d <= b.max).length,
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Durée des parties
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Distribution des durées (en secondes). Permet d’identifier des modes ou cartes plus longs/courts.
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={counts}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="bucket" stroke={TEXT} />
            <YAxis stroke={TEXT} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill={ORANGE} stroke="#000" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HourWinrateBars({
  data,
  periodLabel,
}: {
  data: Array<{ hour: number; winrate: number; total: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Winrate par heure (UTC)
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Taux de victoire moyen selon l’heure (UTC). Pratique pour viser des plages horaires plus favorables.
      </ChartDesc>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke={TEXT} />
            <YAxis stroke={TEXT} domain={[0, 100]} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val: any) => [`${val}%`, "Winrate"]}
              labelFormatter={(l: any) => `Heure ${l}:00`}
            />
            <Bar dataKey="winrate" fill={PINK} stroke="#000" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MapWinrateBars({
  data,
  periodLabel,
}: {
  data: Array<{ map: string; winrate: number }>;
  periodLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="mb-1 font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Meilleures cartes (par winrate)
        </div>
        <PeriodBadge label={periodLabel} />
      </div>
      <ChartDesc>
        Classement des cartes selon votre pourcentage de victoire. À utiliser pour cibler vos points forts/faibles.
      </ChartDesc>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis type="number" stroke={TEXT} domain={[0, 100]} />
            <YAxis type="category" dataKey="map" stroke={TEXT} width={120} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="winrate" fill={YELLOW} stroke="#000" strokeWidth={1.5} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ====== Nouveau : carte “Variations de trophées” (delta + cumul) ======

export function TrophyDeltaArea({
  sampleLabel,
  deltaData,
}: {
  sampleLabel: string; // ex: "(dern. 20 parties)"
  deltaData: Array<{ x: number; delta: number; cumul: number }>;
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-white/15 from-zinc-800/80 to-zinc-900/80 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="space-y-1">
        <div className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
          Variations de trophées {sampleLabel}
        </div>
        <div className="text-xs text-white/80">
          Courbe 1&nbsp;: Δ trophées par partie • Courbe 2&nbsp;: cumul des Δ.
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
                const label = name === "delta" ? "Δ trophées" : "Cumul Δ trophées";
                return [val, `${label} — Partie #${p?.payload?.x}`];
              }}
            />
            <Area
              dataKey="delta"
              type="monotone"
              stroke="#60A5FA"
              fill="url(#gradDelta)"
              strokeWidth={2.2}
              dot={false}
            />
            <Area
              dataKey="cumul"
              type="monotone"
              stroke="#F59E0B"
              fill="url(#gradCumul)"
              strokeWidth={2.2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
