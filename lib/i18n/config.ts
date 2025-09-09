export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(x: string | undefined): x is Locale {
  return !!x && (LOCALES as readonly string[]).includes(x);
}
