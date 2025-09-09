"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/T";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export default function Loading() {
  const pathname = usePathname();
  const { t } = useI18n();

  const tagUp = useMemo(() => {
    const path = typeof pathname === "string" ? pathname : "";
    const m = /\/player\/([^\/?#]+)/.exec(path);
    if (!m || !m[1]) return "—";
    let raw = m[1];
    try {
      raw = decodeURIComponent(raw);
    } catch { }
    const cleaned = String(raw).replace(/^%23|^#/, "").trim();
    return cleaned ? cleaned.toUpperCase() : "—";
  }, [pathname]);

  const [pct, setPct] = useState(12);
  useEffect(() => {
    const tmr = setInterval(() => {
      setPct((p) => (p >= 96 ? 96 : p + Math.max(1, Math.round((100 - p) * 0.06))));
    }, 120);
    return () => clearInterval(tmr);
  }, []);

  const tipKeys = [
    "loading.preparingArena",
    "loading.warmingBrawlers",
    "loading.computingStreaks",
    "loading.polishingTrophies",
  ] as const;

  const tipKey = useMemo(() => {
    const seed = hashSeed(`player-loading:${tagUp}`);
    return tipKeys[seed % tipKeys.length];
  }, [tagUp]);

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,rgba(252,211,77,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_100%,rgba(168,85,247,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_10px)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative w-full overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-[#121B46] via-[#1B2B65] to-[#4C2BBF] p-0 shadow-[0_10px_0_#0B1225,0_18px_32px_rgba(0,0,0,0.5)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <ArenaStreak />

        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-2">
            <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
              BETA
            </span>
            <span className="text-white/85 text-xs sm:text-sm">{t("common.loadingProfile")}</span>
          </div>
        </div>

        <div className="relative grid grid-cols-3 items-center gap-3 px-4 py-6 sm:px-8 sm:py-10">
          <motion.div
            initial={{ x: "-12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="col-span-1 flex flex-col items-center gap-3"
          >
            <BadgeAvatar kind="left" label={`#${tagUp}`} />
            <div className="text-white text-sm sm:text-base font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              {t("loading.playerLabel")}
            </div>
          </motion.div>

          <div className="col-span-1 flex flex-col items-center">
            <VsBurst />
            <div className="mt-2 text-xs text-white/80">{t(tipKey)}</div>
          </div>

          <motion.div
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="col-span-1 flex flex-col items-center gap-3"
          >
            <BadgeAvatar kind="right" label={t("loading.serverLabel")} altTheme />
            <div className="text-white text-sm sm:text-base font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              {t("loading.brawlDataLabel")}
            </div>
          </motion.div>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <ProgressGold value={pct} />
          <div className="mt-1 text-right text-xs text-white/70">
            {pct}% • {t("loading.syncing")}
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>

      <style>{`
        @keyframes flare {
          0% { opacity: .15; transform: scale(0.95) }
          50% { opacity: .6; transform: scale(1.05) }
          100% { opacity: .15; transform: scale(0.95) }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.8); opacity: .6 }
          80% { transform: scale(1.25); opacity: 0 }
          100% { transform: scale(1.25); opacity: 0 }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(220%) }
        }
        @keyframes scan {
          0% { transform: translateY(-100%) }
          100% { transform: translateY(200%) }
        }
      `}</style>
    </div>
  );
}

function ArenaStreak() {
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
        <div
          className="absolute inset-0 h-full w-[2px] bg-white/30 blur-[1px]"
          style={{ animation: "scan 2.6s linear infinite" }}
        />
      </div>
    </div>
  );
}

function BadgeAvatar({
  kind,
  label,
  altTheme = false,
}: {
  kind: "left" | "right";
  label: string;
  altTheme?: boolean;
}) {
  const base = altTheme
    ? "from-sky-300 to-blue-500 shadow-[0_0_16px_rgba(56,189,248,0.5)]"
    : "from-yellow-300 to-amber-500 shadow-[0_0_16px_rgba(251,191,36,0.55)]";
  return (
    <div className="relative">
      <div
        className={[
          "relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-black",
          "bg-gradient-to-b",
          base,
        ].join(" ")}
        style={{ boxShadow: "0 6px 0 #000" }}
      />
      <div className="absolute inset-1 rounded-full border-2 border-black bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.6),rgba(255,255,255,0)_55%)]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-md border-2 border-black bg-black/70 px-2 py-0.5 text-[11px] font-black text-white shadow-[0_2px_0_#000]">
          {label}
        </span>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-yellow-200/40"
        style={{ animation: "pulseRing 1.8s ease-out infinite" }}
      />
    </div>
  );
}

function VsBurst() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-black"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0) 70%)",
          animation: "flare 2.4s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-2 rounded-full bg-gradient-to-b from-fuchsia-400 to-rose-500 border-2 border-black shadow-[0_6px_0_#000]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-md border-2 border-black bg-yellow-300 px-3 py-1 text-sm font-black text-black shadow-[0_3px_0_#000]">
          VS
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
          background: "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.45)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full rounded-[inherit]"
          style={{
            background:
              "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 2.2s ease-in-out infinite",
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
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}
