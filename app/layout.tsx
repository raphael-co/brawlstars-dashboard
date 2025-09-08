import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { DecorLayer } from "@/components/Decor";

export const metadata: Metadata = {
  title: "Brawl Stars Dashboard",
  description: "Stats, complétion et suivi de compte Brawl Stars",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />

            <main className="container mx-auto max-w-6xl px-4 py-6 flex-1">
              <div className="relative rounded-2xl border-4 border-black shadow-[0_12px_0_#0B1225,0_18px_28px_rgba(0,0,0,0.5)]">
                <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md" />
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-4 sm:p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
                    <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_15%_15%,rgba(255,255,255,0.12),transparent_60%)]" />
                    <div className="absolute -right-20 -top-14 h-56 w-[520px] -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
                  </div>

                  <DecorLayer seed="layout-main" stars={6} sparkles={8} />
                  {children}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </div>
            </main>

            <footer className="text-center text-sm text-white/80 py-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              <span className="mr-2 rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 font-extrabold text-black shadow-[0_2px_0_#000]">
                BETA
              </span>
              <span className="opacity-90">Dashboard non officiel — vos retours sont bienvenus ✨</span>
            </footer>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
