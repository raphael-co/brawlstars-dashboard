import { getBattleLog } from '@/lib/brawl'
import Link from 'next/link'
import { DACard } from '@/components/DACard'
import BattlelogChartsClient from '@/components/BattlelogChartsClient'

type BattleItem = {
  battle?: { mode?: string; result?: 'victory' | 'defeat' | 'draw'; duration?: number; trophyChange?: number }
  event?: { mode?: string; map?: string }
  battleTime?: string // 'YYYYMMDDTHHMMSS.000Z'
}

function parseHour(s?: string): number | null {
  if (!s) return null
  const m = s.match(/T(\d{2})/)
  return m ? Number(m[1]) : null
}

function parseEpoch(s?: string): number | null {
  if (!s) return null
  const iso = s.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*Z$/, '$1-$2-$3T$4:$5:$6Z')
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : null
}

function buildPeriodLabel(items: BattleItem[]) {
  const times = (items.map(i => parseEpoch(i.battleTime)).filter(Boolean) as number[])
  if (times.length === 0) return `${items.length} parties`
  const min = Math.min(...times)
  const max = Math.max(...times)
  const spanMs = Math.max(0, max - min)
  const hours = spanMs / 3.6e6
  const labelTime = hours < 36 ? `~${Math.max(1, Math.round(hours))} h` : `~${Math.max(1, Math.round(hours / 24))} j`
  return `${labelTime} • ${items.length} parties`
}

function computeStats(items: BattleItem[]) {
  const total = items.length
  let wins = 0, defeats = 0, draws = 0
  const perMode = new Map<string, { w: number; t: number }>()
  const perMap = new Map<string, { w: number; t: number }>()
  const durations: number[] = []
  const byHour = new Map<number, { w: number; t: number }>()
  const chronological = [...items].reverse() // ancien -> récent
  const seqWR: Array<{ idx: number; wr: number }> = []
  let cumWins = 0

  // --- NOUVEAU: série des deltas de trophées (ancien -> récent) ---
  const deltaData: Array<{ x: number; delta: number; cumul: number }> = []
  let cumul = 0

  chronological.forEach((it, i) => {
    const mode = it?.battle?.mode ?? it?.event?.mode ?? 'unknown'
    const map = it?.event?.map ?? 'unknown'
    const res = it?.battle?.result
    const dur = it?.battle?.duration
    const hr = parseHour(it?.battleTime)
    const dTrophy = Number(it?.battle?.trophyChange ?? 0)

    if (!perMode.has(mode)) perMode.set(mode, { w: 0, t: 0 })
    if (!perMap.has(map)) perMap.set(map, { w: 0, t: 0 })
    perMode.get(mode)!.t++; perMap.get(map)!.t++

    if (res === 'victory') { wins++; perMode.get(mode)!.w++; perMap.get(map)!.w++ }
    else if (res === 'defeat') defeats++
    else if (res === 'draw') draws++

    if (typeof dur === 'number') durations.push(dur)
    if (hr !== null) {
      if (!byHour.has(hr)) byHour.set(hr, { w: 0, t: 0 })
      const h = byHour.get(hr)!; h.t++; if (res === 'victory') h.w++
    }

    if (res === 'victory') cumWins++
    const played = i + 1
    seqWR.push({ idx: played, wr: Math.round((cumWins / played) * 100) })

    // Alimente la série Δ trophées
    cumul += dTrophy
    deltaData.push({ x: played, delta: dTrophy, cumul })
  })

  const global = total ? Math.round((wins / total) * 100) : 0

  const modes = Array.from(perMode.entries())
    .map(([mode, { w, t }]) => ({ mode, winrate: Math.round((w / Math.max(1, t)) * 100), total: t }))

  const maps = Array.from(perMap.entries())
    .map(([map, { w, t }]) => ({ map, winrate: Math.round((w / Math.max(1, t)) * 100), total: t }))

  const hours = Array.from({ length: 24 }).map((_, h) => {
    const v = byHour.get(h) ?? { w: 0, t: 0 }
    return { hour: h, winrate: Math.round((v.w / Math.max(1, v.t)) * 100), total: v.t }
  })

  const resultSplit = [
    { name: 'Victoires', value: wins, key: 'victory' as const },
    { name: 'Défaites', value: defeats, key: 'defeat' as const },
    { name: 'Nuls', value: draws, key: 'draw' as const },
  ]

  const periodLabel = buildPeriodLabel(items)

  return { total, global, resultSplit, modes, maps, durations, hours, seqWR, deltaData, periodLabel }
}

export default async function BattlelogPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const tagUp = tag.toUpperCase()
  const log = await getBattleLog(tagUp)
  const { total, global, resultSplit, modes, maps, durations, hours, seqWR, deltaData, periodLabel } =
    computeStats((log?.items ?? []) as BattleItem[])

  const topMaps = maps
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
        Battlelog{' '}
        <span className="align-middle rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
          #{tagUp}
        </span>
      </h1>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="text-lg font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            Winrate global — <span className="text-yellow-300">{global}%</span>
          </div>
          <div className="text-xs sm:text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
            Période&nbsp;: <span className="font-semibold text-yellow-300">{periodLabel}</span>
          </div>
          <div className="text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
            <Link className="underline decoration-2 underline-offset-2 hover:opacity-90" href={`/player/${tagUp}`}>
              Voir le profil
            </Link>
          </div>
        </div>
      </DACard>

      {/* Charts (client) */}
      <BattlelogChartsClient
        periodLabel={periodLabel}
        resultSplit={resultSplit}
        modes={modes}
        maps={topMaps}
        durations={durations}
        hours={hours}
        seqWR={seqWR}
        deltaData={deltaData}
      />

      <DACard innerClassName="p-4 sm:p-5">
        <section className="space-y-2">
          <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
            Détails récents
          </h2>
          <div className="text-xs text-white/75 mb-2">
            Période&nbsp;: <span className="font-semibold text-yellow-300">{periodLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/90">
                  <th className="py-2 pr-4">Mode</th>
                  <th className="py-2 pr-4">Carte</th>
                  <th className="py-2 pr-4">Résultat</th>
                  <th className="py-2 pr-4">Durée</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {(log.items ?? []).map((it: any, i: number) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="py-2 pr-4">{it?.event?.mode ?? it?.battle?.mode ?? '—'}</td>
                    <td className="py-2 pr-4">{it?.event?.map ?? '—'}</td>
                    <td className="py-2 pr-4 capitalize">{it?.battle?.result ?? '—'}</td>
                    <td className="py-2 pr-4">{formatDuration(it?.battle?.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DACard>
    </div>
  )
}

function formatDuration(s?: number) {
  if (!s || s <= 0) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
