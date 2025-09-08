import { getPlayer, getBrawlers } from '@/lib/brawl'
import { computeCompletion } from '@/lib/completion'

export default async function ComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string }>
}) {
  const { a, b } = await params
  const aUp = a.toUpperCase()
  const bUp = b.toUpperCase()

  // ✅ Utiliser allSettled pour ne pas faire crasher la page si un joueur est introuvable (404)
  const [paRes, pbRes, brawlersRes] = await Promise.allSettled([
    getPlayer(aUp),
    getPlayer(bUp),
    getBrawlers(),
  ] as const)

  const pa = paRes.status === 'fulfilled' ? paRes.value : null
  const pb = pbRes.status === 'fulfilled' ? pbRes.value : null
  const brawlers =
    brawlersRes.status === 'fulfilled' ? brawlersRes.value.items : []

  if (!pa && !pb) {
    return (
      <div className="space-y-4">
        <h1>Comparer #{aUp} ↔ #{bUp}</h1>
        <div className="alert alert-error">
          Impossible de charger les deux joueurs (introuvables ou erreur API).
        </div>
      </div>
    )
  }

  if (!pa || !pb) {
    const missing = !pa ? aUp : bUp
    const ok = pa || pb
    return (
      <div className="space-y-6">
        <h1>Comparer #{aUp} ↔ #{bUp}</h1>
        <div className="alert">
          Joueur #{missing} introuvable (404) ou non accessible. Affichage du joueur disponible.
        </div>
        {ok && (
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>{ok.name}</th>
                <th>—</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Trophées</td><td>{ok.trophies}</td><td>—</td><td>—</td></tr>
              <tr><td>Brawlers possédés</td><td>{computeCompletion(ok, brawlers).ownedBrawlers}</td><td>—</td><td>—</td></tr>
              <tr><td>Star Powers</td><td>{computeCompletion(ok, brawlers).starPowersOwned}</td><td>—</td><td>—</td></tr>
              <tr><td>Gadgets</td><td>{computeCompletion(ok, brawlers).gadgetsOwned}</td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
        )}
      </div>
    )
  }

  const ca = computeCompletion(pa, brawlers)
  const cb = computeCompletion(pb, brawlers)

  function row(label: string, va: string | number, vb: string | number) {
    return (
      <tr key={String(label)}>
        <td>{label}</td>
        <td>{va}</td>
        <td>{vb}</td>
        <td>
          {typeof va === 'number' && typeof vb === 'number'
            ? (va as number) - (vb as number)
            : '—'}
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <h1>Comparer #{aUp} ↔ #{bUp}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{pa.name}</th>
            <th>{pb.name}</th>
            <th>Δ</th>
          </tr>
        </thead>
        <tbody>
          {row('Trophées', pa.trophies, pb.trophies)}
          {row('Brawlers possédés', ca.ownedBrawlers, cb.ownedBrawlers)}
          {row('Star Powers', ca.starPowersOwned, cb.starPowersOwned)}
          {row('Gadgets', ca.gadgetsOwned, cb.gadgetsOwned)}
        </tbody>
      </table>
    </div>
  )
}
