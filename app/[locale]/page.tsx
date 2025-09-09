"use client";
import T, { useI18n } from "@/components/T";
import { DACard } from "@/components/DACard";
import { Lnk } from "@/components/Lnk";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <section className="relative">
        <DACard innerClassName="p-6 sm:p-8">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute -left-3 -top-3 h-8 w-8 rotate-12 text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]" aria-hidden>
            <path d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.44L12 17.77 6.2 19.85l1.1-6.44-4.7-4.58 6.5-.95L12 2z" fill="currentColor" stroke="black" strokeWidth="2" />
          </svg>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-2 -bottom-3 h-6 w-6 -rotate-6 text-amber-300 drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]" aria-hidden>
            <path d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.44L12 17.77 6.2 19.85l1.1-6.44-4.7-4.58 6.5-.95L12 2z" fill="currentColor" stroke="black" strokeWidth="2" />
          </svg>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-8 top-3 h-3 w-3 text-sky-200" aria-hidden>
            <path d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-10 bottom-10 h-2.5 w-2.5 text-fuchsia-200" aria-hidden>
            <path d="M12 3c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z" fill="currentColor" />
          </svg>

          <div className="space-y-4 text-white">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-[11px] font-black text-black shadow-[0_3px_0_#000]">
                <T k="common.beta" />
              </span>
              <span className="text-white/85 text-xs sm:text-sm">
                <T k="home.betaNote" />
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
              <T k="common.star" /> {t("home.titleSuffix")}
            </h1>

            <p className="text-white/90 max-w-2xl drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              <T k="home.intro.beforeTag" />{" "}
              <span className="align-middle rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-1.5 py-0.5 text-[12px] font-black text-black shadow-[0_2px_0_#000]">
                <T k="home.tag" />
              </span>{" "}
              <T k="home.intro.afterTag" />
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/85">
              <span className="opacity-90"><T k="home.examples" /></span>
              <Lnk href="/player/GGUQJ28Q" className="underline decoration-2 underline-offset-2 hover:opacity-90">
                <T k="player.title" />
              </Lnk>
              <span className="opacity-40">•</span>
              <Lnk href="/battlelog/GGUQJ28Q" className="underline decoration-2 underline-offset-2 hover:opacity-90">
                <T k="home.battlelogAndAnalytics" />
              </Lnk>
            </div>
          </div>
        </DACard>
      </section>

      <section className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <DACard innerClassName="p-5 sm:p-6 space-y-3">
            <h2 className="text-white font-extrabold text-xl drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              <T k="home.goals.title" />
            </h2>
            <ul className="text-white/90 space-y-2 leading-relaxed">
              <li>• <T k="home.goals.item1" /></li>
              <li>• <T k="home.goals.item2" /></li>
              <li>• <T k="home.goals.item3" /></li>
              <li>• <T k="home.goals.item4" /></li>
            </ul>
            <p className="text-white/70 text-sm">
              <T k="home.goals.betaNote" />
            </p>
          </DACard>
        </div>

        <div className="lg:col-span-5">
          <DACard innerClassName="p-5 sm:p-6 space-y-3">
            <h3 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              <T k="home.how.title" />
            </h3>
            <ol className="text-white/90 space-y-2 list-decimal pl-5">
              <li><T k="home.how.step1" /></li>
              <li><T k="home.how.step2" /></li>
              <li><T k="home.how.step3" /></li>
            </ol>
            <div className="pt-2">
              <Lnk
                href="/player/GGUQJ28Q"
                className="inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-1.5 text-sm font-extrabold text-black shadow-[0_3px_0_#000] hover:translate-y-[-1px] transition"
              >
                <T k="home.how.exampleCta" />
              </Lnk>
            </div>
          </DACard>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white font-extrabold text-xl drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          <T k="home.find.title" />
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="player.title" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.profileDesc" /></p>
            <Lnk href="/player/GGUQJ28Q" className="underline decoration-2 underline-offset-2 text-sm"><T k="common.open" /></Lnk>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="battlelog.title" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.battlelogDesc" /></p>
            <Lnk href="/battlelog/GGUQJ28Q" className="underline decoration-2 underline-offset-2 text-sm"><T k="home.find.viewCharts" /></Lnk>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="home.find.brawlerFocusTitle" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.brawlerFocusDesc" /></p>
            <span className="text-xs text-white/70"><T k="home.find.brawlerFocusNote" /></span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="home.find.clubsTitle" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.clubsDesc" /></p>
            <span className="text-xs text-white/70"><T k="home.find.clubsNote" /></span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="home.find.rankingsSoonTitle" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.rankingsSoonDesc" /></p>
            <span className="text-xs text-white/70"><T k="home.find.rankingsSoonNote" /></span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]"><T k="home.find.skinsTitle" /></h3>
            <p className="text-white/85 text-sm"><T k="home.find.skinsDesc" /></p>
            <span className="text-xs text-white/70"><T k="home.find.skinsNote" /></span>
          </DACard>
        </div>
      </section>

      <section>
        <DACard innerClassName="p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
            <T k="home.disclaimer" />
          </p>
        </DACard>
      </section>
    </div>
  );
}
