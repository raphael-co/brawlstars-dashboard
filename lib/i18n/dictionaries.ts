import "server-only";
import type { Locale } from "./config";
import fr from "@/dictionaries/fr.json";
import en from "@/dictionaries/en.json";

const DICTS: Record<Locale, any> = { fr, en };

export async function getDictionary(locale: Locale) {
  return DICTS[locale] ?? DICTS.en;
}
