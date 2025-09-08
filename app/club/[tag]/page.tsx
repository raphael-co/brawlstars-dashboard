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

      <DACard innerClassName="p-4 sm:p-5">
        <div className="text-white/90 text-sm mb-2">
          Liste des membres triée par trophées décroissants.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white/90">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Rôle</th>
                <th className="py-2 pr-4">Trophées</th>
                <th className="py-2 pr-4">Profil</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => {
                const tagClean = String(m.tag ?? '').replace(/^#/, '').toUpperCase()
                return (
                  <tr key={m.tag} className="border-t border-white/10">
                    <td className="py-2 pr-4">{m.name ?? '—'}</td>
                    <td className="py-2 pr-4">{humanRole(m.role)}</td>
                    <td className="py-2 pr-4">{m.trophies ?? 0}</td>
                    <td className="py-2 pr-4">
                      {tagClean ? (
                        <Link
                          className="underline decoration-2 underline-offset-2"
                          href={`/player/${tagClean}`}
                        >
                          Voir
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
              {!sorted.length && (
                <tr>
                  <td className="py-3 pr-4" colSpan={4}>Aucun membre.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DACard>
    </div>
  )
}
