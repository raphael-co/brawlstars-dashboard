import { getClub } from '@/lib/brawl'
import Link from 'next/link'
import { DACard } from '@/components/DACard'
import { KPI } from '@/components/KPI'

function humanRole(role?: string) {
  switch ((role ?? '').toLowerCase()) {
    case 'president': return 'Président'
    case 'vicepresident': return 'Vice-président'
    case 'senior': return 'Aîné'
    case 'member': return 'Membre'
    default: return role ?? '—'
  }
}

function roleChipClass(role?: string) {
  switch ((role ?? '').toLowerCase()) {
    case 'president': return 'from-amber-300 to-yellow-500';
    case 'vicepresident': return 'from-sky-300 to-blue-500';
    case 'senior': return 'from-fuchsia-300 to-purple-500';
    default: return 'from-zinc-200 to-zinc-400';
  }
}
function initials(name?: string) {
  const n = String(name ?? '').trim();
  if (!n) return '—';
  const parts = n.split(/\s+/);
  return (parts[0][0] ?? '') + (parts[1]?.[0] ?? '');
}


export default async function ClubPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const tagUp = tag.toUpperCase()
  const club = await getClub(tagUp)

  const members: any[] = Array.isArray(club.members) ? club.members : []
  const membersCount = club.membersCount ?? members.length ?? 0
  const sorted = members.slice().sort((a, b) => (b?.trophies ?? 0) - (a?.trophies ?? 0))

  const roleCounts = members.reduce((acc: Record<string, number>, m: any) => {
    const key = (m?.role ?? 'member').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <DACard>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          {club.name}{' '}
          <span className="align-middle ml-1 inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
            #{tagUp}
          </span>
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-3">
          <KPI label="Membres" value={membersCount} sub="Cap max 30" />
          <KPI label="Type" value={String(club.type ?? '—')} sub="Ouvertures" />
          <KPI label="Trophées requis" value={club.requiredTrophies ?? 0} />
          <KPI
            label="Hiérarchie"
            value={`${roleCounts.president ?? 0}/${roleCounts.vicepresident ?? 0}/${roleCounts.senior ?? 0}`}
            sub="Prés/Vice/Aînés"
          />
        </div>
      </DACard>


      <DACard innerClassName="p-4 sm:p-5 space-y-3">
        <div className="text-white/90 text-sm">
          Membres triés par trophées (décroissant).
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((m, i) => {
            const tagClean = String(m.tag ?? '').replace(/^#/, '').toUpperCase();
            const chipGrad = roleChipClass(m.role);
            return (
              <article
                key={m.tag ?? i}
                className="relative rounded-xl border-2 border-black bg-white/5 p-3 shadow-[0_4px_0_#000]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "grid h-12 w-12 place-items-center rounded-lg border-2 border-black",
                      "bg-gradient-to-br from-sky-300 to-fuchsia-300 text-black font-black",
                      "shadow-[0_3px_0_#000]",
                    ].join(' ')}
                    aria-hidden
                  >
                    {initials(m.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                      {m.name ?? '—'}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span
                        className={[
                          "rounded-md border-2 border-black px-2 py-0.5 text-[11px] font-black text-black",
                          "bg-gradient-to-b shadow-[0_2px_0_#000]",
                          chipGrad,
                        ].join(' ')}
                      >
                        {humanRole(m.role)}
                      </span>
                      <span className="text-xs text-white/70">#{tagClean || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-white/70">Trophées</div>
                    <div className="text-white text-lg font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                      {m.trophies ?? 0}
                    </div>
                  </div>

                  {tagClean ? (
                    <Link
                      href={`/player/${tagClean}`}
                      className="inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2.5 py-1 text-xs font-extrabold text-black shadow-[0_3px_0_#000] hover:-translate-y-0.5 transition"
                    >
                      Voir le profil
                    </Link>
                  ) : (
                    <span className="text-xs text-white/60">Profil indisponible</span>
                  )}
                </div>

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent"
                />
              </article>
            );
          })}

          {!sorted.length && (
            <div className="col-span-full rounded-xl border-2 border-black bg-white/5 p-4 text-white/80 shadow-[0_3px_0_#000]">
              Aucun membre.
            </div>
          )}
        </div>
      </DACard>
    </div>
  )
}
