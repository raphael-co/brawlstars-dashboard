"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Loading() {
  const pathname = usePathname();

  const tagUp = useMemo(() => {
    const m = /\/club\/([^\/?#]+)/.exec(pathname ?? "");
    if (!m) return "—";
    const raw = decodeURIComponent(m[1]);
    return raw.replace(/^%23|^#/, "").toUpperCase();
  }, [pathname]);

  const [pct, setPct] = useState(14);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 96 ? 96 : p + Math.max(1, Math.round((100 - p) * 0.055))));
    }, 120);
    return () => clearInterval(t);
  }, []);

  const tips = [
    "Ouverture des portes du club…",
    "Mise au point des bannières…",
    "Rassemblement des membres…",
    "Polissage de l’emblème ✨…",
  ];
  const tip = tips[Math.floor(Date.now() / 1400) % tips.length];

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_100%,rgba(251,191,36,0.14),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_10px)]" />
        <Confetti />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative w-full overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-[#0E153A] via-[#1B2B65] to-[#3F2FAB] p-0 shadow-[0_10px_0_#0B1225,0_18px_32px_rgba(0,0,0,0.5)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <BackdropScan />

        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-2">
            <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
              BETA
            </span>
            <span className="text-white/85 text-xs sm:text-sm">Chargement du club…</span>
          </div>
        </div>

        <div className="relative grid grid-cols-3 items-center gap-3 px-4 py-6 sm:px-8 sm:py-10">
          <motion.div
            initial={{ x: "-12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="col-span-1 flex items-center justify-center"
          >
            <Banner side="left" />
          </motion.div>

          <div className="col-span-1 flex flex-col items-center justify-center gap-2">
            <Crest tagUp={tagUp} />
            <div className="text-white/85 text-xs sm:text-sm">{tip}</div>
          </div>

          <motion.div
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="col-span-1 flex items-center justify-center"
          >
            <Banner side="right" alt />
          </motion.div>
        </div>

        <div className="px-6 sm:px-8">
          <ProgressGold value={pct} />
          <div className="mt-1 text-right text-xs text-white/70">{pct}% • synchronisation…</div>
        </div>

        <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <div className="text-white/85 text-sm mb-2">Membres</div>
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <MemberRow key={i} delay={i * 0.05} />
            ))}
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        @keyframes flare { 0% { opacity: .18; transform: scale(0.95) } 50% { opacity: .6; transform: scale(1.05) } 100% { opacity: .18; transform: scale(0.95) } }
        @keyframes scan { 0% { transform: translateY(-100%) } 100% { transform: translateY(200%) } }
        @keyframes wave { 0% { transform: skewY(0deg) translateY(0) } 50% { transform: skewY(2deg) translateY(2px) } 100% { transform: skewY(0deg) translateY(0) } }
        @keyframes confetti-fall { 0% { transform: translateY(-20vh) rotate(0deg); opacity: 0 } 10% { opacity: 1 } 100% { transform: translateY(90vh) rotate(360deg); opacity: 0 } }
      `}</style>
    </div>
  );
}

function BackdropScan() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <div className="absolute -left-10 top-10 h-72 w-[120%] -rotate-6 bg-[radial-gradient(600px_300px_at_10%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute -right-10 bottom-10 h-72 w-[120%] rotate-6 bg-[radial-gradient(600px_300px_at_90%_80%,rgba(255,255,255,0.14),transparent_60%)]" />
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_2px,transparent_2px,transparent_18px)]" />
      </div>
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute inset-0 h-full w-[2px] bg-white/30 blur-[1px]" style={{ animation: "scan 2.6s linear infinite" }} />
      </div>
    </div>
  );
}

function Banner({ side, alt = false }: { side: "left" | "right"; alt?: boolean }) {
  const g = alt
    ? "from-sky-300 to-blue-500"
    : "from-yellow-300 to-amber-500";
  const skew = side === "left" ? "-skew-y-1" : "skew-y-1";
  return (
    <div className={`relative h-28 w-20 sm:h-32 sm:w-24 ${skew}`}>
      <div className={`absolute inset-0 rounded-md border-4 border-black bg-gradient-to-b ${g} shadow-[0_6px_0_#000]`} style={{ animation: "wave 2.1s ease-in-out infinite" }} />
      <div className="absolute inset-0 rounded-md" style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,.6), rgba(255,255,255,0) 55%)" }} />
      <div className="absolute bottom-[-10px] left-1/2 h-3 w-2 -translate-x-1/2 rounded-b-md bg-black" />
    </div>
  );
}

function Crest({ tagUp }: { tagUp: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-black"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0) 70%)",
          animation: "flare 2.4s ease-in-out infinite",
        }}
      />
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-black bg-gradient-to-b from-fuchsia-400 to-rose-500 shadow-[0_6px_0_#000]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-md border-2 border-black bg-yellow-300 px-3 py-1 text-sm font-black text-black shadow-[0_3px_0_#000]">
          CLUB
        </span>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-md border-2 border-black bg-black/70 px-2 py-0.5 text-[11px] font-black text-white shadow-[0_2px_0_#000]">
        #{tagUp}
      </div>
    </div>
  );
}

function MemberRow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
      className="relative overflow-hidden rounded-lg border-2 border-black bg-white/5 p-3 shadow-[0_3px_0_#000]"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-md border-2 border-black bg-white/10" />
        <div className="flex-1">
          <div className="relative h-3 w-3/5 overflow-hidden rounded-sm bg-white/10">
            <div className="absolute inset-y-0 -left-full w-1/3" style={{ background: "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)", animation: "shimmer 2.1s ease-in-out infinite" }} />
          </div>
          <div className="mt-2 flex gap-2">
            <Pill />
            <Pill w="w-16" />
            <Pill w="w-12" />
          </div>
        </div>
        <div className="h-6 w-14 rounded border-2 border-black bg-yellow-300 shadow-[0_2px_0_#000]" />
      </div>
    </motion.div>
  );
}

function Pill({ w = "w-20" }: { w?: string }) {
  return (
    <div className={`relative h-2 ${w} overflow-hidden rounded-full bg-white/10`}>
      <div className="absolute inset-y-0 -left-full w-1/3" style={{ background: "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)", animation: "shimmer 2.3s ease-in-out infinite" }} />
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
          background: "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.45)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full rounded-[inherit]"
          style={{
            background: "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 2.2s ease-in-out infinite",
            filter: "brightness(1.05)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 rounded-b-[inherit]"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 18 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 2000,
    dur: 3500 + Math.random() * 2000,
    size: 6 + Math.random() * 8,
    color: i % 3 === 0 ? "#FCD34D" : i % 3 === 1 ? "#60A5FA" : "#F0ABFC",
  }));
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute -top-10 rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            transform: "rotate(15deg)",
            animation: `confetti-fall ${p.dur}ms ease-in infinite`,
            animationDelay: `${p.delay}ms`,
            filter: "drop-shadow(0 0 4px rgba(0,0,0,0.25))",
          }}
        />
      ))}
    </>
  );
}
