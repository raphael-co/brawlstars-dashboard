import { getClub } from '@/lib/brawl'

export default async function ClubPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const tagUp = tag.toUpperCase()
  const club = await getClub(tagUp)
  return (
    <div className="space-y-6">
      <h1>{club.name} <span className="badge">#{tagUp}</span></h1>
      <div className="card">
        <div className="opacity-70">Type: {club.type} • Trophées requis: {club.requiredTrophies}</div>
        <div className="opacity-70">Membres: {club.members?.length ?? club.membersCount ?? 0}</div>
      </div>
      <section className="space-y-2">
        <h2>Membres</h2>
        <table className="table">
          <thead><tr><th>Nom</th><th>Rôle</th><th>Trophées</th></tr></thead>
          <tbody>
            {(club.members ?? []).map((m: any) => (
              <tr key={m.tag}>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>{m.trophies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
