"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [state, setState] = useState<{ locale: string; dict: Dict }>({ locale: "en", dict: {} });
  useEffect(() => {
    setState(safeReadDict());
  }, []);

  const t = useMemo(() => (path: string) => getByPath(state.dict, path), [state.dict]);
  return { t, locale: state.locale };
}

export default function T({ k }: { k: string }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
