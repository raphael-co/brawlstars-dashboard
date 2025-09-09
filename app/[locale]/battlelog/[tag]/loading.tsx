"use client";
import { useI18n } from "@/components/T";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Loading() {
  const pathname = usePathname();

  const tagUp = useMemo(() => {
    const m = /\/player\/([^\/?#]+)/.exec(pathname ?? "");
    if (!m) return "—";
    const raw = decodeURIComponent(m[1]);
    return raw.replace(/^%23|^#/, "").toUpperCase();
  }, [pathname]);

  const [pct, setPct] = useState(12);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 96 ? 96 : p + Math.max(1, Math.round((100 - p) * 0.06))));
    }, 120);
    return () => clearInterval(t);
  }, []);

  const { t } = useI18n();
  const tips = [t("loading.collecting"), t("loading.gearing"), t("loading.wr"), t("loading.polishTrophies")];
  const tip = tips[Math.floor(Date.now() / 1500) % tips.length];

  const stars = useMemo(() => {
    const out: Array<{ left: number; top: number; s: number; d: number }> = [];
    let seed = [...tagUp].reduce((a, c) => a + c.charCodeAt(0), 0) || 42;
    const rnd = () => ((seed = (seed * 48271) % 0x7fffffff) / 0x7fffffff);
    for (let i = 0; i < 30; i++) {
      out.push({
        left: Math.round(rnd() * 100),
        top: Math.round(rnd() * 100),
        s: 0.6 + rnd() * 1.1,
        d: 2 + rnd() * 3.5,
      });
    }
    return out;
  }, [tagUp]);

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
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
              animation: `twinkle ${st.d}s ease-in-out ${i * 97}ms infinite`,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative w-full rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_16px_28px_rgba(0,0,0,0.45)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.09)_0,rgba(255,255,255,0.09)_2px,transparent_2px,transparent_10px)]" />
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
              BETA
            </span>
            <span className="text-white/85 text-xs sm:text-sm">
              {t('common.loadingProfile')}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <Coin />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
                Profil <span className="align-middle rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-black text-black shadow-[0_3px_0_#000]">#{tagUp}</span>
              </h1>
              <p className="text-white/85 text-sm">{tip}</p>
            </div>
          </div>

          <div className="mt-6">
            <ProgressGold value={pct} />
            <div className="mt-1 text-right text-xs text-white/70">
              {pct}% • optimisation des assets…
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </motion.div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: .25; transform: translateY(0px) scale(1); }
          50% { opacity: 1; transform: translateY(-2px) scale(1.15); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) }
          100% { transform: translateX(220%) }
        }
      `}</style>
    </div>
  );
}

function Coin() {
  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
      <div
        className="absolute inset-0 rounded-full border-2 border-black shadow-[0_4px_0_#000,0_0_16px_rgba(255,216,0,0.6)]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #FFE58A 0%, #FCD34D 45%, #F59E0B 70%, #C2410C 100%)",
          animation: "spin-slow 4.5s linear infinite",
        }}
        aria-hidden
      />
      <div className="absolute inset-1 rounded-full border-2 border-black bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.6),rgba(255,255,255,0)_55%)]" />
      <div className="relative flex h-full w-full items-center justify-center text-black">
        <span className="inline-flex items-center justify-center rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-[12px] font-black shadow-[0_2px_0_#000]">
          ⭐
        </span>
      </div>
    </div>
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
          background:
            "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.45)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full rounded-[inherit]"
          style={{
            background:
              "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 2.4s ease-in-out infinite",
            filter: "brightness(1.05)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 rounded-b-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}
