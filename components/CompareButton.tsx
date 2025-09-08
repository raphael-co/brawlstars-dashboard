// CompareButton.tsx — DA Brawl Stars pour le bouton + modal
"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type Props = {
  currentTag: string;
  defaultOpponentTag?: string;
  className?: string;
};

/**
 * Bouton "Comparer" + modal stylés Brawl Stars.
 * Génère des petites étoiles aléatoires dans le modal, stables jusqu'au reload (useMemo).
 */
export default function CompareButton({
  currentTag,
  defaultOpponentTag = "8PQL0J2",
  className,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [input, setInput] = useState("");

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const normalize = (s: string) =>
    s.trim().replace(/^%23/, "").replace(/^#/, "").toUpperCase();

  const submit = () => {
    const other = normalize(input || defaultOpponentTag);
    close();
    router.push(`/compare/${normalize(currentTag)}/${other}`);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") close();
  };

  // Petites étoiles/sparkles aléatoires, figées pendant la session
  const stars = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const left = Math.floor(Math.random() * 85) + 5; // 5%..90%
        const top = Math.floor(Math.random() * 70) + 10; // 10%..80%
        const size = Math.floor(Math.random() * 6) + 6; // 6..11px
        const colors = ["text-yellow-300", "text-amber-300", "text-yellow-200", "text-amber-200", "text-amber-400"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rot = [-12, -6, -3, 0, 3, 6, 12][Math.floor(Math.random() * 7)];
        return { key: `st-${i}`, left, top, size, color, rot };
      }),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const left = Math.floor(Math.random() * 85) + 5;
        const top = Math.floor(Math.random() * 70) + 10;
        const size = Math.floor(Math.random() * 4) + 2; // 2..5px
        const colors = ["text-sky-200", "text-fuchsia-200", "text-sky-100", "text-fuchsia-100", "text-sky-300"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return { key: `sp-${i}`, left, top, size, color };
      }),
    []
  );

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
        Comparer
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-2xl p-0 backdrop:bg-black/50"
      >
        {/* Carte DA Brawl */}
        <div className="relative w-[min(92vw,520px)] rounded-2xl border-4 border-black shadow-[0_12px_0_#0B1225,0_18px_28px_rgba(0,0,0,0.5)]">
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md" />
          {/* Intérieur */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-5">
            {/* Textures */}
            <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
              <div className="absolute inset-0 bg-[radial-gradient(520px_260px_at_20%_15%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="absolute -right-14 -top-12 h-48 w-[480px] -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
            </div>

            {/* Éléments décor aléatoires */}
            {stars.map(({ key, left, top, size, color, rot }) => (
              <svg
                key={key}
                viewBox="0 0 24 24"
                className={`pointer-events-none absolute ${color} drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]`}
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, transform: `rotate(${rot}deg)` }}
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
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                aria-hidden
              >
                <path
                  d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z"
                  fill="currentColor"
                />
              </svg>
            ))}

            {/* Contenu modal */}
            <h3 className="text-lg font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] mb-3">
              Comparer avec un autre tag
            </h3>
            <p className="text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] mb-4">
              Saisis un tag Brawl Stars (ex: <code>#8PQL0J2</code>). Si tu laisses vide, on utilisera{" "}
              <b>{defaultOpponentTag}</b>.
            </p>

            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Ex: ${defaultOpponentTag}`}
              className="w-full rounded-xl border-2 border-black bg-white/10 px-3 py-2 shadow-[0_4px_0_#000] backdrop-blur-sm placeholder:text-white/70 outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border-2 border-black bg-gradient-to-b from-zinc-200 to-zinc-300 px-4 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
                onClick={close}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-xl border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-4 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
                onClick={submit}
              >
                Comparer
              </button>
            </div>

            {/* Liseré bas */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </dialog>
    </>
  );
}
