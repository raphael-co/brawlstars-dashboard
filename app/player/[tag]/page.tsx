import { getPlayer, getBrawlers, getCosmetics, getBrawlerAssets, isHttpError, HttpError } from '@/lib/brawl'
import { computeCompletion } from '@/lib/completion'
import { KPI } from '@/components/KPI'
import OwnedToggle from '@/components/OwnedToggle'
import CompareButton from '@/components/CompareButton'
import Link from 'next/link'
import { AccountCompletion } from '@/components/AccountCompletion'
import { DACard } from '@/components/DACard'

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const tagUp = tag.toUpperCase()

  let player: any | null = null
  let brawlersData: any | null = null
  let cosmetics: any[] | null = null
  let assets: { items: Array<{ id: number; name: string; imageUrl?: string|null; imageUrl2?: string|null }> } | null = null
  let comp:
    | {
        ownedBrawlers: number
        totalBrawlers: number
        brawlersCompletion: number
        starPowersOwned: number
        starPowersTotal: number
        gadgetsOwned: number
        gadgetsTotal: number
        gearsOwned: number
        gearsTotal: number
      }
    | null = null

  try {
    const [p, b, c, a] = await Promise.all([
      getPlayer(tagUp),
      getBrawlers(),
      getCosmetics(),
      getBrawlerAssets(),
    ] as const)

    player = p
    brawlersData = b
    cosmetics = Array.isArray(c) ? c : c?.items ?? []
    assets = a ?? { items: [] }
    const brawlers = brawlersData?.items ?? []
    comp = computeCompletion(player, brawlers)
  } catch (e) {
    const err = e as unknown
    const renderDetails = (he: HttpError) => (
      <details className="mt-2 rounded-lg border border-white/20 bg-white/5 p-3 text-xs text-white/90">
        <summary className="cursor-pointer">Détails de l’erreur</summary>
        <div className="mt-2 space-y-1">
          <div><b>Status:</b> {he.status}</div>
          {he.code !== undefined && <div><b>Code:</b> {String(he.code)}</div>}
          <div><b>Message:</b> {he.message}</div>
          {he.url && <div><b>URL:</b> {he.url}</div>}
          {he.body && (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-black/50 p-2">
{JSON.stringify(he.body, null, 2)}
            </pre>
          )}
        </div>
      </details>
    )

    return (
      <div className="space-y-4">
        <h1>Joueur #{tagUp}</h1>
        <div className="text-sm opacity-70">Impossible de charger les données.</div>
        {isHttpError(err) ? (
          renderDetails(err)
        ) : (
          <details className="mt-2 rounded-lg border border-white/20 bg-white/5 p-3 text-xs text-white/90">
            <summary className="cursor-pointer">Détails</summary>
            <pre className="mt-2">{String(err)}</pre>
          </details>
        )}
      </div>
    )
  }

  const assetMap = new Map<number, string>(
    (assets?.items ?? [])
      .filter((x) => Number.isFinite(x?.id))
      .map((x) => [Number(x.id), (x.imageUrl2 || x.imageUrl || '').toString()])
  )
  const imgFor = (id: number) => {
    const u = assetMap.get(Number(id))
    return u && u.startsWith('http') ? u : undefined
  }

  const all: any[] = brawlersData?.items ?? []
  const ownedIds = new Set<number>((player?.brawlers ?? []).map((b: any) => Number(b.id)))
  const missing = all
    .filter((b: any) => !ownedIds.has(Number(b.id)))
    .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))

  return (
    <div className="space-y-8">
      {player && brawlersData && cosmetics && comp ? (
        <>
          <section className="relative gap-4 items-center w-full">
            <div className="relative md:col-span-2">
              <DACard>
                <div className="space-y-2 text-white">
                  <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
                    {player.name}{' '}
                    <span className="align-middle ml-1 inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                      #{tagUp}
                    </span>
                  </h1>

                  <div className="opacity-90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                    Niveau {player.expLevel} • Trophées: <b className="font-extrabold">{player.trophies}</b>{' '}
                    (record: {player.highestTrophies})
                    {player.club && (
                      <span>
                        {' '}
                        • Club: <b className="font-extrabold">{player.club.name}</b> •{' '}
                        <Link className="underline decoration-2 underline-offset-2 hover:opacity-90" href={`/club/${player.club.tag.replace(/^#/, '')}`}>
                          voir
                        </Link>
                      </span>
                    )}
                  </div>

                  <div className="text-sm mt-2 flex gap-3">
                    <Link className="underline decoration-2 underline-offset-2" href={`/battlelog/${tagUp}`}>
                      Battlelog
                    </Link>
                    <CompareButton currentTag={tagUp} defaultOpponentTag="GGUQJ28Q" className="underline decoration-2 underline-offset-2 cursor-pointer" />
                  </div>
                </div>
              </DACard>

              <div className="hidden md:block" />
            </div>
          </section>

          <section className="items-center">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
              <KPI label="Trophées" value={player.trophies} sub="Total actuel" />
              <KPI label="3v3 Victoires" value={player['3vs3Victories'] ?? 0} />
              <KPI label="Solo/Duo" value={`${player.soloVictories ?? 0} / ${player.duoVictories ?? 0}`} />
            </div>
          </section>

          <AccountCompletion comp={comp} />

          <section className="space-y-3">
            <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              Vos Brawlers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(player.brawlers ?? [])
                .slice()
                .sort((a: any, b: any) => b.trophies - a.trophies)
                .map((pb: any, i: number) => (
                  <DACard key={pb.id} delay={i * 0.05}>
                    <Link href={`/player/${tagUp}/brawler/${pb.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          {imgFor(pb.id) ? (
                            <img
                              alt={pb.name}
                              src={imgFor(pb.id)!}
                              className="w-16 h-16 rounded-xl border-2 border-black object-cover bg-zinc-800"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-black bg-zinc-800 grid place-items-center text-white/70">
                              {pb.name?.[0] ?? '?'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-white">
                            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{pb.name}</div>
                            <div className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                              Rang {pb.rank}
                            </div>
                          </div>
                          <div className="text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                            Trophées: {pb.trophies} • Record: {pb.highestTrophies} • Power {pb.power}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </DACard>
                ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              Brawlers non possédés ({missing.length})
            </h2>
            <p className="text-xs text-white/80">
              Inclus&nbsp;: tous les brawlers de la base, même ceux pas encore sortis.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {missing.map((b: any, i: number) => (
                <DACard key={b.id} delay={i * 0.03}>
                  <Link href={`/player/${tagUp}/brawler/${b.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {imgFor(b.id) ? (
                          <img
                            alt={b.name}
                            src={imgFor(b.id)!}
                            className="w-16 h-16 rounded-xl border-2 border-black object-cover bg-zinc-800"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border-2 border-black bg-zinc-800 grid place-items-center text-white/70">
                            {b.name?.[0] ?? '?'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-white">
                          <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{b.name}</div>
                          <div className="rounded-md border-2 border-black bg-gradient-to-b from-zinc-200 to-zinc-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                            Non possédé
                          </div>
                        </div>
                        <div className="text-sm text白/90">
                          <b className="font-extrabold">SP:</b> {b.starPowers?.map((s: any) => s.name).join(', ') || '—'}
                        </div>
                        <div className="text-sm text-white/90">
                          <b className="font-extrabold">Gadgets:</b> {b.gadgets?.map((g: any) => g.name).join(', ') || '—'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </DACard>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div>Chargement des données...</div>
      )}
    </div>
  )
}

function SkinsList({ cosmetics }: { cosmetics: any }) {
  if (!cosmetics) return <div className="opacity-70">Non disponible</div>
  const skins: any[] = cosmetics
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skins.slice(0, 60).map((skin, i) => (
        <DACard key={skin.id} delay={i * 0.04}>
          <div className="flex items-center justify-between text-white">
            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{skin.name}</div>
            <OwnedToggle skinId={skin.id} />
          </div>
          {skin.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={skin.name} src={skin.imageUrl} className="rounded-xl border-2 border-black" />
          )}
          <div className="text-xs text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
            {skin.brawler?.name ?? 'Brawler inconnu'}
          </div>
        </DACard>
      ))}
    </div>
  )
}
