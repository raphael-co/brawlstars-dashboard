"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function Loading() {
  const sp = useSearchParams();
  const country = (sp?.get("country") ?? "global").toLowerCase();
  const kind = (sp?.get("kind") ?? "players") as "players" | "clubs" | "brawlers";
  const brawlerId = sp?.get("brawlerId") ?? "";

  const tips = [
    "Récupération du leaderboard…",
    "Mise en orbite des médailles…",
    "Ajustement des paillettes ✨…",
    "Préparation des fiches joueurs…",
  ];
  const tip = tips[Math.floor(Date.now() / 1400) % tips.length];

  const stars = useMemo(() => {
    const seedStr = `${country}-${kind}-${brawlerId}`;
    let seed = [...seedStr].reduce((a, c) => a + c.charCodeAt(0), 0) || 42;
    const rnd = () => ((seed = (seed * 48271) % 0x7fffffff) / 0x7fffffff);
    return Array.from({ length: 28 }).map(() => ({
      left: Math.round(rnd() * 100),
      top: Math.round(rnd() * 100),
      s: 0.6 + rnd() * 1.1,
      d: 2 + rnd() * 3.2,
      delay: Math.round(rnd() * 800),
    }));
  }, [country, kind, brawlerId]);

  const [pct, setPct] = useState(8);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 96 ? 96 : p + Math.max(1, Math.round((100 - p) * 0.06))));
    }, 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-5xl p-6" role="status" aria-live="polite" aria-busy="true">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,rgba(252,211,77,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_100%,rgba(99,102,241,0.14),transparent_60%)]" />
        {stars.map((st, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${st.left}%`,
              top: `${st.top}%`,
              width: `${st.s * 3}px`,
              height: `${st.s * 3}px`,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0) 70%)",
              animation: `twinkle ${st.d}s ease-in-out ${st.delay}ms infinite`,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_16px_28px_rgba(0,0,0,0.45)]"
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.09)_0,rgba(255,255,255,0.09)_2px,transparent_2px,transparent_10px)]" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
              BETA
            </span>
            <span className="text-white/85 text-xs sm:text-sm">{tip}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
              Classements
            </h1>
            <Pill>{flagEmoji(country)} {country.toUpperCase()}</Pill>
            <Pill>{kindLabel(kind)}</Pill>
            {kind === "brawlers" && <Pill glow>#{brawlerId}</Pill>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-black bg-white/10 p-3 shadow-[0_3px_0_#000]">
                <div className="h-3 w-20 rounded bg-white/20" />
                <div className="mt-2 h-9 w-full overflow-hidden rounded-md border-2 border-black bg-white/70">
                  <Shimmer />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <ProgressGold value={pct} />
            <div className="mt-1 text-right text-xs text-white/70">{pct}% • synchronisation…</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group relative grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-xl border-2 border-black bg-white/5 p-3 shadow-[0_4px_0_#000]"
              >
                <Medal rank={i + 1} />
                <div className="min-w-0">
                  <div className="h-4 w-40 rounded bg-white/25">
                    <Shimmer />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <div className="h-3 w-16 rounded bg-white/15 relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <span className="opacity-40">•</span>
                    <div className="h-3 w-10 rounded bg-white/10 relative overflow-hidden">
                      <Shimmer />
                    </div>
                    {kind !== "clubs" && (
                      <>
                        <span className="opacity-40">•</span>
                        <div className="h-3 w-14 rounded bg-white/10 relative overflow-hidden">
                          <Shimmer />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-5 w-16 rounded bg-white/25 relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="mt-1 h-3 w-12 rounded bg-white/15 relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="mt-1 text-[11px] text-white/80 underline decoration-2 underline-offset-2 opacity-0 group-hover:opacity-100 transition">
                    …
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </motion.div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: .25; transform: translateY(0px) scale(1); }
          50% { opacity: 1; transform: translateY(-2px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(220%) }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  );
}

function kindLabel(k: "players" | "clubs" | "brawlers") {
  return k === "players" ? "Joueurs" : k === "clubs" ? "Clubs" : "Brawlers";
}

function flagEmoji(cc: string) {
  const c = cc.toUpperCase();
  if (c === "GLOBAL") return "🌍";
  if (!/^[A-Z]{2}$/.test(c)) return "🏳️";
  const codePoints = [...c].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function Pill({ children, glow = false }: { children: React.ReactNode; glow?: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-md border-2 border-black px-2 py-1 text-xs font-semibold shadow-[0_2px_0_#000]",
        glow ? "bg-gradient-to-b from-yellow-300 to-amber-400 text-black" : "bg-white/10 text-white/90",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Shimmer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full rounded-[inherit]"
      style={{
        background:
          "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
        animation: "shimmer 2.2s ease-in-out infinite",
      }}
    />
  );
}

function ProgressGold({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full border-2 border-black bg-zinc-200 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
      <div
        className="relative h-full transition-[width] duration-500 ease-out will-change-[width]"
        style={{
          width: `${v}%`,
          background: "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.45)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full rounded-[inherit]"
          style={{
            background:
              "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 2.4s ease-in-out infinite",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function Medal({ rank }: { rank: number }) {
  const medalCls =
    rank === 1
      ? "from-yellow-300 to-amber-500"
      : rank === 2
      ? "from-zinc-200 to-zinc-400"
      : rank === 3
      ? "from-amber-700 to-amber-900"
      : "from-white to-white/80";

  return (
    <div className="relative">
      <motion.div
        className={[
          "grid h-10 w-10 place-items-center rounded-lg border-2 border-black",
          "bg-gradient-to-b font-black text-black shadow-[0_3px_0_#000]",
          medalCls,
        ].join(" ")}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {rank <= 3 ? "★" : rank}
      </motion.div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
          animation: "shimmer 2.6s ease-in-out infinite",
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
}
