// components/Decor.tsx
"use client";

import React from "react";

/**
 * Décor déterministe (seeded) sans hooks conditionnels ni early-return avant hooks.
 * Évite les mismatches d’hydratation :
 *  - pas de Math.random()
 *  - valeurs de style en chaînes ("10px", "65%", "rotate(6deg)")
 *  - ordre de hooks constant
 */

// --- RNG déterministe ---
function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0];
}
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFromSeed(seed: string) {
  const [h] = cyrb128(seed);
  return mulberry32(h);
}

// --- Types ---
type StarSpec = {
  leftPct: string; // "65%"
  topPct: string;  // "20%"
  sizePx: string;  // "10px"
  rotate: string;  // "rotate(6deg)"
  color:
    | "text-yellow-300"
    | "text-amber-300"
    | "text-yellow-200"
    | "text-amber-200"
    | "text-amber-400";
};
type SparkSpec = {
  leftPct: string;
  topPct: string;
  sizePx: string;
  color:
    | "text-sky-200"
    | "text-fuchsia-200"
    | "text-sky-100"
    | "text-fuchsia-100"
    | "text-sky-300";
};

// --- Builders ---
function buildStars(
  seed: string,
  count: number,
  bounds = { left: [5, 90], top: [8, 85], size: [6, 12] }
): StarSpec[] {
  const rnd = rngFromSeed(`stars:${seed}:${count}`);
  const colors: StarSpec["color"][] = [
    "text-yellow-300",
    "text-amber-300",
    "text-yellow-200",
    "text-amber-200",
    "text-amber-400",
  ];
  const rots = [-12, -6, -3, 0, 3, 6, 12];
  return Array.from({ length: count }).map(() => {
    const left = bounds.left[0] + rnd() * (bounds.left[1] - bounds.left[0]);
    const top = bounds.top[0] + rnd() * (bounds.top[1] - bounds.top[0]);
    const size = Math.round(
      bounds.size[0] + rnd() * (bounds.size[1] - bounds.size[0])
    );
    const rotateDeg = rots[Math.floor(rnd() * rots.length)];
    const color = colors[Math.floor(rnd() * colors.length)];
    return {
      leftPct: `${left.toFixed(0)}%`,
      topPct: `${top.toFixed(0)}%`,
      sizePx: `${size}px`,
      rotate: `rotate(${rotateDeg}deg)`,
      color,
    };
  });
}

function buildSparkles(
  seed: string,
  count: number,
  bounds = { left: [5, 90], top: [8, 85], size: [2, 5] }
): SparkSpec[] {
  const rnd = rngFromSeed(`sparks:${seed}:${count}`);
  const colors: SparkSpec["color"][] = [
    "text-sky-200",
    "text-fuchsia-200",
    "text-sky-100",
    "text-fuchsia-100",
    "text-sky-300",
  ];
  return Array.from({ length: count }).map(() => {
    const left = bounds.left[0] + rnd() * (bounds.left[1] - bounds.left[0]);
    const top = bounds.top[0] + rnd() * (bounds.top[1] - bounds.top[0]);
    const size = Math.round(
      bounds.size[0] + rnd() * (bounds.size[1] - bounds.size[0])
    );
    const color = colors[Math.floor(rnd() * colors.length)];
    return {
      leftPct: `${left.toFixed(0)}%`,
      topPct: `${top.toFixed(0)}%`,
      sizePx: `${size}px`,
      color,
    };
  });
}

// --- Composant ---
export function DecorLayer({
  seed = "default",
  stars = 6,
  sparkles = 8,
}: {
  seed?: string;
  stars?: number;
  sparkles?: number;
}) {
  // Hooks *toujours* appelés, aucun early-return avant.
  const specs = React.useMemo(
    () => ({
      stars: buildStars(seed, stars),
      sparks: buildSparkles(seed, sparkles),
    }),
    [seed, stars, sparkles]
  );

  return (
    <>
      {specs.stars.map((it, i) => (
        <svg
          key={`st-${i}`}
          viewBox="0 0 24 24"
          className={`pointer-events-none absolute ${it.color} drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]`}
          style={{
            left: it.leftPct,
            top: it.topPct,
            width: it.sizePx,
            height: it.sizePx,
            transform: it.rotate,
          }}
          aria-hidden
        >
          <path
            d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.44L12 17.77 6.2 19.85l1.1-6.44-4.7-4.58 6.5-.95L12 2z"
            fill="currentColor"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      ))}
      {specs.sparks.map((it, i) => (
        <svg
          key={`sp-${i}`}
          viewBox="0 0 24 24"
          className={`pointer-events-none absolute ${it.color}`}
          style={{
            left: it.leftPct,
            top: it.topPct,
            width: it.sizePx,
            height: it.sizePx,
          }}
          aria-hidden
        >
          <path
            d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </>
  );
}
