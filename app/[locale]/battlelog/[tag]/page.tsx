import T, { useI18n } from "@/components/T";
import { Lnk } from "@/components/Lnk";
import { getBattleLog, getBrawlerAssets } from '@/lib/brawl'
import Link from 'next/link'
import { DACard } from '@/components/DACard'
import BattlelogChartsClient from '@/components/BattlelogChartsClient'
import clsx from 'clsx'

type BattleItem = {
  battle?: {
    mode?: string
    result?: 'victory' | 'defeat' | 'draw'
    duration?: number
    trophyChange?: number
    teams?: Array<Array<{ tag?: string; name?: string; brawler?: { id?: number; name?: string } }>>
    players?: Array<{ tag?: string; name?: string; brawler?: { id?: number; name?: string } }>
    starPlayer?: { tag?: string }
  }
  event?: { mode?: string; map?: string }
  battleTime?: string
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
  const chronological = [...items].reverse()
  const seqWR: Array<{ idx: number; wr: number }> = []
  const deltaData: Array<{ x: number; delta: number; cumul: number }> = []
  let cumWins = 0
  let cumul = 0

  chronological.forEach((it, i) => {
    const mode = it?.battle?.mode ?? it?.event?.mode ?? 'unknown'
    const map = it?.event?.map ?? 'unknown'
    const res = it?.battle?.result
    const dur = it?.battle?.duration
    const hr = parseHour(it?.battle?.players?.length ? it.battleTime : it?.battleTime)
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

function ResultBadge({ result, delta }: { result?: 'victory' | 'defeat' | 'draw'; delta?: number }) {
  const base = 'rounded-md border-2 border-black px-2 py-0.5 text-xs font-extrabold shadow-[0_2px_0_#000]'
  if (result === 'victory') return <span className={`${base} bg-gradient-to-b from-green-300 to-emerald-400 text-black`}>Victoire {typeof delta === 'number' ? `(+${delta})` : ''}</span>
  if (result === 'defeat') return <span className={`${base} bg-gradient-to-b from-rose-300 to-red-400 text-black`}>Défaite {typeof delta === 'number' ? `(${delta})` : ''}</span>
  return <span className={`${base} bg-gradient-to-b from-zinc-200 to-zinc-400 text-black`}><T k="battlelog.draw" /></span>
}

function normTag(tag?: string | null) {
  return String(tag ?? '').replace(/^%23/, '').replace(/^#/, '').toUpperCase()
}

function Avatar({ url, isStar }: { url?: string; isStar?: boolean }) {
  return (
    <div className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0">
      {url ? (
        <img src={url} alt="" className="h-full w-full rounded-lg border-2 border-black object-cover" />
      ) : (
        <div className="h-full w-full rounded-lg border-2 border-black bg-white/10" />
      )}
      {isStar && (
        <span className="absolute -top-1 -left-1 text-xs leading-none">
          <span className="inline-flex items-center justify-center rounded-full border-2 border-black bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-black shadow-[0_2px_0_#000]">⭐</span>
        </span>
      )}
    </div>
  )
}

function TeamFaces({
  team,
  imgById,
  starTag,
}: {
  team: Array<{ tag?: string; name?: string; brawler?: { id?: number; name?: string } }>
  imgById: Map<number, string>
  starTag?: string
}) {
  const star = normTag(starTag)
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {team.map((p, i) => {
        const id = Number(p?.brawler?.id)
        const url = Number.isFinite(id) ? (imgById.get(id) || '') : ''
        const isStar = star && normTag(p?.tag) === star
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={clsx(
                "relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg border-2 object-cover",
                isStar
                  ? "border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                  : "border-black"
              )}
              style={{
                backgroundImage: url ? `url(${url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {isStar && (
              <span className="text-[10px] font-bold text-yellow-300 drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
                Brawl Star
              </span>
            )}
            <div className="text-xs text-white/90 leading-tight text-center">
              <div className="font-bold">{p?.brawler?.name ?? '—'}</div>
              <Lnk
                className="text-white/80"
                href={`/player/${normTag(p?.tag)}`}
              >
                {p?.name ?? ''}
              </Lnk>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function BattlelogPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const tagUp = tag.toUpperCase()
  const log = await getBattleLog(tagUp)
  const assets = await getBrawlerAssets().catch(() => ({ items: [] as Array<{ id: number; imageUrl?: string | null; imageUrl2?: string | null }> }))
  const imgById = new Map<number, string>()
  for (const it of assets.items ?? []) {
    const url = it.imageUrl2 || it.imageUrl
    if (Number.isFinite(it.id) && url) imgById.set(it.id, url)
  }

  const { global, resultSplit, modes, maps, durations, hours, seqWR, deltaData, periodLabel } =
    computeStats((log?.items ?? []) as BattleItem[])

  const topMaps = maps.sort((a, b) => b.total - a.total).slice(0, 6)

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
            <Lnk className="underline decoration-2 underline-offset-2 hover:opacity-90" href={`/player/${tagUp}`}>
              <T k="common.seeProfile" />
            </Lnk>
          </div>
        </div>
      </DACard>

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

      <div className="p-4 sm:p-5 space-y-3">
        <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          Détails récents
        </h2>
        <div className="text-xs text-white/75">
          Période&nbsp;: <span className="font-semibold text-yellow-300">{periodLabel}</span>
        </div>

        <div className="space-y-4">
          {(log.items ?? []).map((it: any, i: number) => {
            const mode = it?.battle?.mode ?? it?.event?.mode ?? '—'
            const map = it?.event?.map ?? '—'
            const res = it?.battle?.result as 'victory' | 'defeat' | 'draw' | undefined
            const dt = it?.battle?.trophyChange as number | undefined
            const dur = it?.battle?.duration as number | undefined
            const teams = (it?.battle?.teams as any[]) || null
            const players = (it?.battle?.players as any[]) || null
            const starTag = it?.battle?.starPlayer?.tag

            return (
              <DACard key={i}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-white">
                  <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                    {mode} • <span className="text-white/90">{map}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ResultBadge result={res} delta={dt} />
                    <div className="text-xs text-white/80">{formatDuration(dur)}</div>
                  </div>
                </div>

                {teams && teams.length >= 2 ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-center">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <TeamFaces team={teams[0] || []} imgById={imgById} starTag={starTag} />
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="rounded-lg border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_2px_0_#000]">
                        VS
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <TeamFaces team={teams[1] || []} imgById={imgById} starTag={starTag} />
                    </div>
                  </div>
                ) : players && players.length ? (
                  <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                    {players.map((p: any, j: number) => (
                      <div key={j} className="flex justify-center">
                        <TeamFaces team={[p]} imgById={imgById} starTag={starTag} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </DACard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatDuration(s?: number) {
  if (!s || s <= 0) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
