"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/config";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const setLocale = (to: Locale) => {
    if (!pathname) return;
    const parts = pathname.split("/");
    parts[1] = to;
    const nextPath = parts.join("/");
    document.cookie = `NEXT_LOCALE=${to}; path=/; max-age=31536000`;
    router.push(nextPath as any);
  };

  return (
    <div className="inline-flex gap-2">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-md border px-2 py-1 text-sm ${l === locale ? "bg-yellow-300 text-black border-black" : "bg-white/10 text-white border-white/30"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
