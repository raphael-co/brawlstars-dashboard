"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import T, { useI18n } from "./T";

type Props = {
  currentTag: string;
  defaultOpponentTag?: string;
  className?: string;
};

type Star = {
  key: string;
  left: number;
  top: number;
  size: number;
  color: string;
  rot: number;
};

type Sparkle = {
  key: string;
  left: number;
  top: number;
  size: number;
  color: string;
};

function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export default function CompareButton({
  currentTag,
  defaultOpponentTag = "GGUQJ28Q",
  className,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const { locale, t } = useI18n();

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  const close = () => dialogRef.current?.close();

  const normalize = (s: string) =>
    s.trim().replace(/^%23/, "").replace(/^#/, "").toUpperCase();

  const submit = () => {
    const other = normalize(input || defaultOpponentTag);
    close();
    router.push(`/${locale}/compare/${normalize(currentTag)}/${other}`);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") close();
  };

  const baseSeed = useMemo(
    () => `compare:${normalize(currentTag)}:${normalize(defaultOpponentTag)}`,
    [currentTag, defaultOpponentTag]
  );

  const stars = useMemo<Star[]>(() => {
    const rnd = mulberry32(hashSeed(`${baseSeed}:stars`));
    const colors = ["text-yellow-300", "text-amber-300", "text-yellow-200", "text-amber-200", "text-amber-400"];
    const rots = [-12, -6, -3, 0, 3, 6, 12];
    const arr: Star[] = [];
    for (let i = 0; i < 6; i++) {
      const left = 5 + Math.floor(rnd() * 85);
      const top = 10 + Math.floor(rnd() * 70);
      const size = 6 + Math.floor(rnd() * 6);
      const color = pick(colors, rnd);
      const rot = pick(rots, rnd);
      arr.push({ key: `st-${i}`, left, top, size, color, rot });
    }
    return arr;
  }, [baseSeed]);

  const sparkles = useMemo<Sparkle[]>(() => {
    const rnd = mulberry32(hashSeed(`${baseSeed}:sparkles`));
    const colors = ["text-sky-200", "text-fuchsia-200", "text-sky-100", "text-fuchsia-100", "text-sky-300"];
    const arr: Sparkle[] = [];
    for (let i = 0; i < 8; i++) {
      const left = 5 + Math.floor(rnd() * 85);
      const top = 10 + Math.floor(rnd() * 70);
      const size = 2 + Math.floor(rnd() * 4);
      const color = pick(colors, rnd);
      arr.push({ key: `sp-${i}`, left, top, size, color });
    }
    return arr;
  }, [baseSeed]);

  return (
    <>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-1.5 font-extrabold text-black shadow-[0_3px_0_#000] active:translate-y-[2px] active:shadow-[0_1px_0_#000]",
          className
        )}
        onClick={open}
      >
        <T k="common.compare" />
      </button>

      <dialog ref={dialogRef} className="rounded-2xl p-0 backdrop:bg-black/50">
        <div className="relative w-[min(92vw,520px)] rounded-2xl border-4 border-black shadow-[0_12px_0_#0B1225,0_18px_28px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md" />
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-5">
            <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
              <div className="absolute inset-0 bg-[radial-gradient(520px_260px_at_20%_15%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="absolute -right-14 -top-12 h-48 w-[480px] -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
            </div>

            {stars.map(({ key, left, top, size, color, rot }) => (
              <svg
                key={key}
                viewBox="0 0 24 24"
                className={`pointer-events-none absolute ${color} drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: `rotate(${rot}deg)`,
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

            {sparkles.map(({ key, left, top, size, color }) => (
              <svg
                key={key}
                viewBox="0 0 24 24"
                className={`pointer-events-none absolute ${color}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                aria-hidden
              >
                <path
                  d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z"
                  fill="currentColor"
                />
              </svg>
            ))}

            <h3 className="mb-3 text-lg font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              <T k="compare.dialog.title" />
            </h3>
            <p className="mb-4 text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              <T k="compare.dialog.helpPrefix" />
              <code>#{normalize(defaultOpponentTag)}</code>.{" "}
              <T k="compare.dialog.helpSuffix" /> <b>{defaultOpponentTag}</b>.
            </p>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`${t("common.eg")} ${defaultOpponentTag}`}
              className={clsx(
                "mb-4 w-full rounded-xl border-2 border-black bg-white/10 px-3 py-2 text-white",
                "shadow-[0_4px_0_#000] backdrop-blur-sm placeholder:text-white/70",
                "outline-none focus:bg-white/15 focus:border-yellow-300",
                "focus-visible:ring-2 focus-visible:ring-yellow-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              )}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border-2 border-black bg-gradient-to-b from-zinc-200 to-zinc-300 px-4 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
                onClick={close}
              >
                <T k="common.cancel" />
              </button>
              <button
                type="button"
                className="rounded-xl border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-4 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
                onClick={submit}
              >
                <T k="common.compare" />
              </button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </dialog>
    </>
  );
}
