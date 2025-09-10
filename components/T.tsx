"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import en from "@/dictionaries/en.json";
import fr from "@/dictionaries/fr.json";

type Dict = Record<string, any>;

function safeReadDict(): { locale: string; dict: Dict } {
  if (typeof document === "undefined") {
    return { locale: "en", dict: {} };
  }
  const root = document.querySelector("[data-locale][data-dict]") as HTMLElement | null;
  const locale = root?.getAttribute("data-locale") || "en";
  const raw = root?.getAttribute("data-dict") || "{}";
  let dict: Dict = {};
  try { dict = JSON.parse(raw as string) ?? {}; } catch { }
  return { locale, dict };
}

function getByPath(dict: Dict, path: string): string {
  return path.split(".").reduce<any>((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), dict) ?? path;
}

export function useI18n() {
  const pathname = usePathname() || "/";
  const firstSeg = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale = firstSeg === "fr" || firstSeg === "en" ? firstSeg : "en";
  const dict: Dict = locale === "fr" ? (fr as any) : (en as any);

  const t = useMemo(
    () => (path: string) => getByPath(dict, path) ?? path,
    [dict]
  );
  return { t, locale };
}

export default function T({ k }: { k: string }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
