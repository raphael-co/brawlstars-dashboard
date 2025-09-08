import { getRankings } from '@/lib/brawl'

export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>
  searchParams: Promise<{ kind?: string; brawlerId?: string }>
}) {
  const { country } = await params
  const { kind = 'players', brawlerId } = await searchParams
  const k = (kind as 'players'|'clubs'|'brawlers')
  const data = await getRankings(country, k, brawlerId)
  return (
    <div className="space-y-6">
      <h1>Classements {country.toUpperCase()} – {k}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Trophées</th>
          </tr>
        </thead>
        <tbody>
          {(data.items ?? []).map((it: any, i: number) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{it?.name ?? it?.club?.name ?? it?.brawler?.name ?? '—'}</td>
              <td>{it?.trophies ?? it?.rank ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
