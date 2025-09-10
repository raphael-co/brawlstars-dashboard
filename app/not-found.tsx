"use client";
import { useMemo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lnk } from "@/components/Lnk";
import { useI18n } from "@/components/T";

export default function NotFound() {
  const pathname = usePathname();
  console.log(pathname);
  
  const { t } = useI18n();
  const [pct, setPct] = useState(12);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 96 ? 96 : p + Math.max(1, Math.round((100 - p) * 0.06))));
    }, 120);
    return () => clearInterval(t);
  }, []);

  const stars = useMemo(() => {
    const out: Array<{ left: number; top: number; s: number; d: number }> = [];
    let seed = [...(pathname || "404")]?.reduce((a, c) => a + c.charCodeAt(0), 0) || 42;
    const rnd = () => ((seed = (seed * 48271) % 0x7fffffff) / 0x7fffffff);
    for (let i = 0; i < 40; i++) {
      out.push({ left: Math.round(rnd() * 100), top: Math.round(rnd() * 100), s: 0.6 + rnd() * 1.2, d: 2 + rnd() * 3.5 });
    }
    return out;
  }, [pathname]);

  return (
    <div className="relative mx-auto flex min-h-[75vh] w-full max-w-5xl items-center justify-center p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_15%_10%,rgba(252,211,77,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_85%_100%,rgba(99,102,241,0.16),transparent_60%)]" />
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
        initial={{ y: 14, scale: 0.985, filter: "brightness(0.95)" }}
        animate={{ y: 0, scale: 1, filter: "brightness(1)" }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative w-full rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_16px_28px_rgba(0,0,0,0.45)]"
        role="alert"
        aria-live="polite"
      >
        <div className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12)_0,rgba(255,255,255,0)_60%)]" />
            <div className="absolute -right-16 -top-10 h-48 w-[520px] -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
                {t("common.beta")}
              </span>
              <span className="text-white/85 text-xs sm:text-sm">{t("notFound.lostLead")}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>{t("notFound.route")}</span>
              <code className="rounded bg-black/30 px-2 py-0.5 text-white/90">{pathname || "/?"}</code>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-[auto,1fr] sm:items-center">
            <div className="mx-auto sm:mx-0">
              <Coin />
            </div>
            <div>
              <h1 className="leading-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
                <span className="block text-[44px] xs:text-5xl sm:text-6xl font-black tracking-tight">
                  <span className="inline-block rounded-lg border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 pb-1 text-black shadow-[0_4px_0_#000] mr-2">404</span>
                  {t("notFound.title")}
                </span>
              </h1>
              <p className="mt-2 max-w-prose text-sm sm:text-base text-white/85">
                {t("notFound.subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <ProgressGold value={pct} />
            <div className="mt-1 text-right text-[11px] sm:text-xs text-white/70">{pct}% • {t("notFound.recalibrating")}</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Lnk
              href="/"
              className="inline-flex items-center justify-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-2 text-sm font-extrabold text-black shadow-[0_3px_0_#000] hover:-translate-y-0.5 transition"
            >
              ← {t("notFound.backHome")}
            </Lnk>
            <Lnk
              href="/ranked"
              className="inline-flex items-center justify-center rounded-md border-2 border-black bg-white/90 px-3 py-2 text-sm font-extrabold text-black shadow-[0_3px_0_#000] hover:-translate-y-0.5 transition"
            >
              {t("notFound.viewRankings")}
            </Lnk>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink href="/ranked?kind=players" title={t("rankings.topPlayers")} sub={t("rankings.quick.playersSub")} icon="⭐" />      
            <QuickLink href="/ranked?kind=clubs" title={t("rankings.topClubs")} sub={t("rankings.quick.clubsSub")} icon="🏆" />
            <QuickLink href="/ranked?kind=brawlers" title={t("rankings.topBrawlers")} sub={t("rankings.quick.brawlersSub")} icon="🧪" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </motion.div>

      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: .25; transform: translateY(0px) scale(1); } 50% { opacity: 1; transform: translateY(-2px) scale(1.15); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
      `}</style>
    </div>
  );
}

function QuickLink({ href, title, sub, icon }: { href: string; title: string; sub: string; icon: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, rotate: -0.5 }}
      whileTap={{ scale: 0.99, rotate: 0.25 }}
      className="relative rounded-xl border-2 border-black bg-white/5 p-3 shadow-[0_4px_0_#000]"
    >
      <Lnk href={href} className="block focus:outline-none">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 text-black text-xl font-black shadow-[0_3px_0_#000]">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="truncate font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{title}</div>
            <div className="text-xs text-white/70">{sub}</div>
          </div>
        </div>
      </Lnk>
    </motion.div>
  );
}

function Coin() {
  return (
    <div className="relative h-16 w-16 sm:h-20 sm:w-20" aria-hidden>
      <div
        className="absolute inset-0 rounded-full border-2 border-black shadow-[0_4px_0_#000,0_0_16px_rgba(255,216,0,0.55)]"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFE58A 0%, #FCD34D 45%, #F59E0B 70%, #C2410C 100%)",
          animation: "spin-slow 5.2s linear infinite",
        }}
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
          background: "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.45)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full rounded-[inherit]"
          style={{
            background: "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 2.4s ease-in-out infinite",
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
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)" }}
      />
    </div>
  );
}
