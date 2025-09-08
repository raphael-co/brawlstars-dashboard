"use client";

import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/Progress";

type AccountCompletionProps = {
  comp: {
    ownedBrawlers: number;
    totalBrawlers: number;
    brawlersCompletion: number;
    starPowersOwned: number;
    starPowersTotal: number;
    gadgetsOwned: number;
    gadgetsTotal: number;
    gearsOwned: number;
    gearsTotal: number;
  };
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98, filter: "brightness(0.9)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "brightness(1)",
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
};

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
};

export function AccountCompletion({ comp }: AccountCompletionProps) {
  const pct = (a: number, b: number) =>
    `${Math.round((a / Math.max(1, b)) * 100)}%`;

  console.log(comp);
  
  const items = [
    {
      label: "Brawlers",
      owned: comp.ownedBrawlers,
      total: comp.totalBrawlers,
      value: Math.max(0, Math.min(100, comp.brawlersCompletion)),
    },
    {
      label: "Star Powers",
      owned: comp.starPowersOwned,
      total: comp.starPowersTotal,
      value: Math.round(
        (comp.starPowersOwned / Math.max(1, comp.starPowersTotal)) * 100
      ),
    },
    {
      label: "Gadgets",
      owned: comp.gadgetsOwned,
      total: comp.gadgetsTotal,
      value: Math.round(
        (comp.gadgetsOwned / Math.max(1, comp.gadgetsTotal)) * 100
      ),
    },
    {
      label: "Gears (approx.)",
      owned: comp.gearsOwned,
      total: comp.gearsTotal,
      value: Math.round(
        (comp.gearsOwned / Math.max(1, comp.gearsTotal)) * 100
      ),
    },
  ];

  return (
    <section className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]"
      >
        Complétion du compte
      </motion.h2>

      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -4, rotate: -0.5 }}
            whileTap={{ scale: 0.99, rotate: 0.25 }}
            className="relative rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_14px_28px_rgba(0,0,0,0.45)]"
          >
            {/* Glow animé léger */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.5, 0.82, 0.5] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Contenu intérieur */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-4 space-y-2">
              {/* Texture */}
              <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
                <div className="absolute inset-0 bg-[radial-gradient(300px_150px_at_20%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
                <div className="absolute -right-8 -top-8 h-32 w-52 -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="font-bold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                  {item.owned} / {item.total} ({pct(item.owned, item.total)})
                </div>
              </div>

              {/* Progress Bar */}
              <Progress
                value={item.value}
                className="h-3 rounded-full border-2 border-black bg-zinc-200/30 overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.5)]"
                indicatorClassName="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 shadow-[0_3px_0_rgba(0,0,0,0.4)]"
              />

              {/* Liseré bas */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
