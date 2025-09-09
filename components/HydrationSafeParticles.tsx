"use client";

import { useMemo } from "react";

type Particle = {
  left: string;
  top: string;
  size: number;
  rotate: number;
  className: string;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function HydrationSafeParticles({
  seed,
  count = 10,
  className = "",
}: {
  seed: string;
  count?: number;
  className?: string;
}) {
  const particles = useMemo<Particle[]>(() => {
    const rnd = mulberry32(hashSeed(seed));
    const colors = [
      "text-amber-300",
      "text-amber-200",
      "text-yellow-300",
      "text-yellow-200",
      "text-sky-300",
      "text-sky-200",
      "text-fuchsia-200",
    ];
    const sizes = [2, 3, 4, 5, 6, 8, 9, 11];
    const rots = [-6, -3, 0, 3, 6];

    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const left = 5 + Math.floor(rnd() * 90);
      const top = 5 + Math.floor(rnd() * 90);
      const size = sizes[Math.floor(rnd() * sizes.length)];
      const rotate = rots[Math.floor(rnd() * rots.length)];
      const className = colors[Math.floor(rnd() * colors.length)];
      arr.push({
        left: `${left}%`,
        top: `${top}%`,
        size,
        rotate,
        className,
      });
    }
    return arr;
  }, [seed, count]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute drop-shadow-[0_3px_0_rgba(0,0,0,0.6)] ${p.className}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
