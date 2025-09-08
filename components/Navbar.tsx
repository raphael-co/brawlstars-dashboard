"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Trophy } from "lucide-react";

export function Navbar() {
  const [tag, setTag] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) return;
    const normalized = tag.replace(/^%23/, "").replace(/^#/, "").toUpperCase();
    router.push(`/player/${encodeURIComponent(normalized)}`);
  }

  return (
    <header className="relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 translate-y-3 bg-black/30 blur-lg" />
      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative w-full rounded-2xl border-4 border-black bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] shadow-[0_10px_0_#0B1225,0_14px_28px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md" />
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_2px,transparent_2px,transparent_8px)]" />

          <div className="relative z-10 flex min-h-[105px] sm:min-h-[130px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 text-sm font-extrabold text-black shadow-[0_3px_0_#000]">
                ★
              </span>
              <Link
                href="/"
                className="font-extrabold tracking-[0.06em] text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] text-lg sm:text-xl"
              >
                Brawl Stats+
              </Link>
            </div>

            <form
              onSubmit={submit}
              role="search"
              className="flex-1 max-w-xl flex items-center gap-2 sm:gap-3 w-full"
            >
              <label className="sr-only" htmlFor="tag">
                Tag
              </label>
              <div className="flex-1 flex items-center gap-2 rounded-xl border-2 border-black bg-white/10 px-3 py-2 shadow-[0_4px_0_#000] backdrop-blur-sm">
                <Search className="h-4 w-4 opacity-80" />
                <input
                  id="tag"
                  className="bg-transparent outline-none w-full placeholder:text-white/70"
                  placeholder="Entrez votre tag (ex: #GGUQJ28Q)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  inputMode="text"
                />
              </div>
              <button
                className="hidden sm:inline-flex rounded-xl border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-4 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
                type="submit"
              >
                Voir
              </button>
            </form>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/ranked"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-2 text-sm font-extrabold text-black shadow-[0_4px_0_#000] hover:translate-y-[-1px] transition"
              >
                <Trophy className="h-4 w-4" />
                Classements
              </Link>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <button
                className="rounded-xl border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-2 font-extrabold text-black shadow-[0_4px_0_#000] active:translate-y-[2px]"
                type="submit"
                formAction=""
                onClick={(e) => {
                  const form = (e.currentTarget.closest("header") as HTMLElement)?.querySelector("form");
                  (form as HTMLFormElement)?.requestSubmit?.();
                }}
              >
                Go
              </button>
              <button
                aria-label="Ouvrir le menu"
                aria-expanded={open}
                aria-controls="mobile-nav"
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-xl border-2 border-black bg-white/90 text-black shadow-[0_3px_0_#000] active:translate-y-[1px]"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div
            id="mobile-nav"
            className={[
              "sm:hidden grid transition-[grid-template-rows] duration-300",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            ].join(" ")}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4">
                <nav className="grid gap-2">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border-2 border-black bg-white/85 px-3 py-2 font-extrabold text-black shadow-[0_3px_0_#000]"
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/ranked"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-2 font-extrabold text-black shadow-[0_3px_0_#000]"
                  >
                    <Trophy className="h-4 w-4" />
                    Classements
                  </Link>
                  <Link
                    href="/compare/GGUQJ28Q/8PQL0J2"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border-2 border-black bg-white/85 px-3 py-2 font-extrabold text-black shadow-[0_3px_0_#000]"
                  >
                    Comparer (exemple)
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-3 top-2 h-3 w-3 rounded-full bg-white/80 opacity-70" />
          <div className="pointer-events-none absolute right-6 bottom-3 h-2 w-2 rounded-full bg-white/80 opacity-70" />
        </div>
      </div>
    </header>
  );
}
