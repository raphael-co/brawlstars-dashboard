"use client";

import { motion } from "framer-motion";
import React from "react";

type KPIProps = {
  label: string;
  value: string | number;
  sub?: string;
};

export function KPI({ label, value, sub }: KPIProps) {
  return (
    <motion.div
      initial={{ y: 12, scale: 0.98, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      whileHover={{ y: -4, rotate: -0.5 }}
      whileTap={{ scale: 0.98, rotate: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative h-full"
    >
      <div className="relative rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_12px_24px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-300/20 via-fuchsia-300/10 to-sky-300/20 blur-md" />

        <div className="relative min-h-[105px] sm:min-h-[130px] overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12)_0,rgba(255,255,255,0)_60%)]" />
            <div className="absolute -right-8 -top-10 h-40 w-64 -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.15)_0,rgba(255,255,255,0.15)_2px,transparent_2px,transparent_6px)]" />
          </div>

          <Star className="absolute -left-3 -top-3 h-8 w-8 rotate-12 text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]" />
          <Star className="absolute right-2 -bottom-3 h-6 w-6 -rotate-6 text-amber-300 drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]" />
          <Sparkle className="absolute left-7 top-2 h-3 w-3 text-sky-200" />
          <Sparkle className="absolute right-6 bottom-6 h-2.5 w-2.5 text-fuchsia-200" />

          <motion.div className="flex flex-col gap-1 text-white">
            <div className="inline-flex items-center gap-2">
              <Badge>★</Badge>
              <div className="text-[11px] font-black uppercase tracking-widest text-yellow-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                {label}
              </div>
            </div>

            <motion.div
              key={String(value)}
              initial={{ scale: 0.9, filter: "brightness(0.8)" }}
              animate={{ scale: 1, filter: "brightness(1)" }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="flex items-baseline gap-2"
            >
              <div className="text-3xl sm:text-4xl font-extrabold leading-none text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.75)]">
                {value}
              </div>
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-2 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 shadow-[0_3px_0_rgba(0,0,0,0.4)]"
                />
              </div>
            </motion.div>

            {sub && (
              <div className="mt-1 text-xs font-medium text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                {sub}
              </div>
            )}
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 text-[10px] font-extrabold text-black shadow-[0_3px_0_#000]">
      {children}
    </span>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
      aria-hidden
    >
      <path
        d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.44L12 17.77 6.2 19.85l1.1-6.44-4.7-4.58 6.5-.95L12 2z"
        fill="currentColor"
        stroke="black"
        strokeWidth="2"
      />
    </motion.svg>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      aria-hidden
    >
      <path
        d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z"
        fill="currentColor"
      />
    </motion.svg>
  );
}
