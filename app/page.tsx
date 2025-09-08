import Link from "next/link";
import { DACard } from "@/components/DACard";

export default function Home() {
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
                BETA
              </span>
              <span className="text-white/85 text-xs sm:text-sm">
                L’application évolue encore — vos retours sont bienvenus ✨
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
              Brawl Stars Dashboard
            </h1>

            <p className="text-white/90 max-w-2xl drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              Entrez votre <span className="align-middle rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-1.5 py-0.5 text-[12px] font-black text-black shadow-[0_2px_0_#000]">tag</span> dans la barre en haut pour explorer vos stats :
              trophées, brawlers, star powers, gadgets, progression de complétion, battlelog, club et plus.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/85">
              <span className="opacity-90">Exemples&nbsp;:</span>
              <Link href="/player/GGUQJ28Q" className="underline decoration-2 underline-offset-2 hover:opacity-90">
                Profil joueur
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/battlelog/GGUQJ28Q" className="underline decoration-2 underline-offset-2 hover:opacity-90">
                Battlelog & analytics
              </Link>
            </div>
          </div>
        </DACard>
      </section>

      <section className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <DACard innerClassName="p-5 sm:p-6 space-y-3">
            <h2 className="text-white font-extrabold text-xl drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              Objectifs de l’app
            </h2>
            <ul className="text-white/90 space-y-2 leading-relaxed">
              <li>• Offrir une vue claire et <b>lisible</b> de votre progression.</li>
              <li>• Analyser vos matchs récents avec des <b>charts</b> (winrate, durée, heures, cartes).</li>
              <li>• Suivre la <b>complétion</b> : brawlers, star powers, gadgets, gears, skins.</li>
              <li>• Centraliser club, comparaisons, et <b>classements</b> (à venir).</li>
            </ul>
            <p className="text-white/70 text-sm">
              Cette version est une <b>BETA</b> : certaines pages/sources de données peuvent changer.
            </p>
          </DACard>
        </div>

        <div className="lg:col-span-5">
          <DACard innerClassName="p-5 sm:p-6 space-y-3">
            <h3 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              Comment commencer&nbsp;?
            </h3>
            <ol className="text-white/90 space-y-2 list-decimal pl-5">
              <li>Récupérez votre <b>tag</b> en jeu (ex&nbsp;: <code>#8PQL0J2</code>).</li>
              <li>Collez-le dans la barre en haut puis validez.</li>
              <li>Explorez les pages <b>Profil</b>, <b>Battlelog</b>, <b>Brawlers</b>, <b>Club</b>…</li>
            </ol>
            <div className="pt-2">
              <Link
                href="/player/GGUQJ28Q"
                className="inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-3 py-1.5 text-sm font-extrabold text-black shadow-[0_3px_0_#000] hover:translate-y-[-1px] transition"
              >
                Voir un profil exemple
              </Link>
            </div>
          </DACard>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-white font-extrabold text-xl drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          Ce que vous trouverez ici
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Profil joueur</h3>
            <p className="text-white/85 text-sm">KPIs, niveaux, trophées, historique, club, et complétion en un clin d’œil.</p>
            <Link href="/player/GGUQJ28Q" className="underline decoration-2 underline-offset-2 text-sm">Ouvrir</Link>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Battlelog & Analytics</h3>
            <p className="text-white/85 text-sm">Winrate global, par mode & carte, durées, heures de perf, tendances.</p>
            <Link href="/battlelog/GGUQJ28Q" className="underline decoration-2 underline-offset-2 text-sm">Voir les charts</Link>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Focus Brawler</h3>
            <p className="text-white/85 text-sm">Stats par brawler, série, deltas de trophées, modes favoris.</p>
            <span className="text-xs text-white/70">Depuis la page Profil &gt; liste de brawlers</span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Skins & Cosmétiques</h3>
            <p className="text-white/85 text-sm">Liste complète (Brawlify) avec marquage local des skins possédés.</p>
            <span className="text-xs text-white/70">Non-officiel, données indicatives</span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Clubs</h3>
            <p className="text-white/85 text-sm">Infos club, membres, rôles et trophées requis.</p>
            <span className="text-xs text-white/70">Accès via Profil &gt; Club</span>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <h3 className="font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">Classements (bientôt)</h3>
            <p className="text-white/85 text-sm">Top locaux et mondiaux par pays / catégorie.</p>
            <span className="text-xs text-white/70">En cours de construction</span>
          </DACard>
        </div>
      </section>

      <section>
        <DACard innerClassName="p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
            Projet non-officiel. Données issues de l’API Supercell et de Brawlify quand indiqué. Cette BETA peut comporter des imprécisions
            ou changements de structure. Merci pour vos retours !
          </p>
        </DACard>
      </section>
    </div>
  );
}
