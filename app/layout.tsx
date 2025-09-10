function I18nProvider({
  locale,
  dict,
  children
}: {
  locale: Locale;
  dict: any;
  children: React.ReactNode;
}) {
  return (
    <div data-locale={locale} data-dict={JSON.stringify(dict)}>
      {children}
    </div>
  );
}



import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brawl Stars Dashboard",
  description: "Stats, complétion et suivi de compte Brawl Stars",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : "en";
  const dict = await getDictionary(loc);
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={[
          "min-h-screen",
          "bg-[#0d0f17]",
          "relative",
          "text-white",
        ].join(" ")}
      >

        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(800px_300px_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="pointer-events-none fixed inset-0 opacity-[0.07] mix-blend-screen bg-[repeating-linear-gradient(135deg,#ffffff_0,#ffffff_2px,transparent_2px,transparent_10px)]" />

        {children}
      </body>
    </html>
  );
}
