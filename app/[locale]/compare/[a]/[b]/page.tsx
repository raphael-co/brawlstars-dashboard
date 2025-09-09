import T from "@/components/T";
import { Lnk } from "@/components/Lnk";
import { getPlayer, getBrawlers } from '@/lib/brawl'
import { computeCompletion } from '@/lib/completion'
import { DACard } from '@/components/DACard'
import { Progress } from '@/components/Progress'

type PlayerLite = {
  name: string
  tag: string
  trophies: number
  highestTrophies: number
  expLevel: number
  expPoints: number
  club?: { name: string; tag: string }
  ['3vs3Victories']?: number
  soloVictories?: number
  duoVictories?: number
  brawlers: Array<{
    id: number
    name: string
    power: number
    rank: number
    trophies: number
    highestTrophies: number
    starPowers: Array<{ id: number; name: string }>
    gadgets: Array<{ id: number; name: string }>
    gears?: Array<{ id: number; name: string }>
  }>
}

type Better = 'higher' | 'lower'

function normTag(tag: string) {
  return String(tag).replace(/^%23/, '').replace(/^#/, '').toUpperCase()
}
function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0) }
function avg(arr: number[]) { return arr.length ? Math.round((sum(arr) / arr.length) * 10) / 10 : 0 }
function bucketCount(nums: number[], pred: (n: number) => boolean) {
  return nums.reduce((c, n) => c + (pred(n) ? 1 : 0), 0)
}
function percentile(arr: number[], p: number) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const idx = Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))))
  return s[idx]
}

function playerDeepStats(p: PlayerLite) {
  const powers = p.brawlers.map(b => b.power)
  const ranks = p.brawlers.map(b => b.rank)
  const btroph = p.brawlers.map(b => b.trophies)
  const bmax = p.brawlers.map(b => b.highestTrophies)

  const power11 = bucketCount(powers, n => n >= 11)
  const power10 = bucketCount(powers, n => n >= 10)
  const power9m = bucketCount(powers, n => n >= 9)

  const rank30 = bucketCount(ranks, n => n >= 30)
  const rank25 = bucketCount(ranks, n => n >= 25)
  const rank20 = bucketCount(ranks, n => n >= 20)

  const at500 = bucketCount(btroph, n => n >= 500)
  const at600 = bucketCount(btroph, n => n >= 600)
  const at750 = bucketCount(btroph, n => n >= 750)
  const at1k = bucketCount(btroph, n => n >= 1000)

  const maxRank = ranks.length ? Math.max(...ranks) : 0
  const maxPow = powers.length ? Math.max(...powers) : 0

  const avgPower = avg(powers)
  const avgRank = avg(ranks)
  const avgBTroph = Math.round(avg(btroph))

  const p50 = percentile(btroph, 50)
  const p75 = percentile(btroph, 75)
  const p90 = percentile(btroph, 90)

  const gearsOwned = sum(p.brawlers.map(b => b.gears?.length ?? 0))

  return {
    power11, power10, power9m,
    rank30, rank25, rank20,
    at500, at600, at750, at1k,
    maxRank, maxPow,
    avgPower, avgRank, avgBTroph,
    p50, p75, p90,
    gearsOwned,
  }
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="align-middle rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_2px_0_#000]">
      {children}
    </span>
  )
}

function StatBadge({ label, value, highlight = false }: { label: React.ReactNode; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={[
      "rounded-xl border-2 px-3 py-2 text-sm",
      "bg-white/5 border-white/10",
      highlight ? "ring-2 ring-yellow-300/60" : ""
    ].join(" ")}>
      <div className="text-white/70">{label}</div>
      <div className="text-white font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{value}</div>
    </div>
  )
}

function DualStat({
  label,
  aName, bName,
  aVal, bVal,
}: {
  label: React.ReactNode
  aName: string
  bName: string
  aVal: number
  bVal: number
}) {
  const d = aVal - bVal
  const leader =
    d > 0 ? aName : d < 0 ? bName : '—'
  const badgeCls =
    d > 0 ? 'bg-emerald-400' : d < 0 ? 'bg-rose-400' : 'bg-zinc-300'

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-white/75 text-sm">{label}</div>

      <div className="mt-2 grid grid-cols-2 gap-3 text-white">
        <div>
          <div className="text-xs text-white/70">{aName}</div>
          <div className="font-extrabold">{aVal}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/70">{bName}</div>
          <div className="font-extrabold">{bVal}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-white/70"><T k="compare.delta" /></span>
        <span className={[
          "inline-flex items-center rounded-md border-2 border-black px-2 py-0.5 font-black text-black shadow-[0_2px_0_#000]",
          badgeCls,
        ].join(" ")}>
          {d > 0 ? `+${d}` : d}
        </span>
      </div>

      <div className="mt-1 text-right text-xs text-white/75">
        <T k="compare.leader" /> : <span className="font-semibold">{leader}</span>
      </div>
    </div>
  )
}

function TwoBars({
  label,
  aName,
  bName,
  aVal,
  bVal,
  max,
  better = "higher",
}: {
  label: React.ReactNode
  aName: string
  bName: string
  aVal: number
  bVal: number
  max: number
  better?: "higher" | "lower"
}) {
  const safeMax = Math.max(1, max)
  const aPct = Math.round((aVal / safeMax) * 100)
  const bPct = Math.round((bVal / safeMax) * 100)
  const aWins = better === "higher" ? aVal > bVal : aVal < bVal
  const bWins = better === "higher" ? bVal > aVal : bVal < aVal
  return (
    <div className="space-y-1.5">
      <div className="text-white/80 text-sm">{label}</div>
      <div className="grid gap-2">
        <div>
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>{aName}</span><span className="font-bold text-white">{aVal}</span>
          </div>
          <Progress
            value={aPct}
            className="h-3"
            indicatorClassName={aWins ? "" : "opacity-60"}
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>{bName}</span><span className="font-bold text-white">{bVal}</span>
          </div>
          <Progress
            value={bPct}
            className="h-3"
            indicatorClassName={bWins ? "" : "opacity-60"}
          />
        </div>
      </div>
    </div>
  )
}

function deltaLabel(a: number, b: number) {
  const d = a - b
  if (d === 0) return { txt: "=", cls: "text-white/80" }
  if (d > 0) return { txt: `+${d}`, cls: "text-green-300" }
  return { txt: `${d}`, cls: "text-rose-300" }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string }>
}) {
  const { a, b } = await params
  const aUp = normTag(a)
  const bUp = normTag(b)

  const [paRes, pbRes, brawlersRes] = await Promise.allSettled([
    getPlayer(aUp),
    getPlayer(bUp),
    getBrawlers(),
  ] as const)

  const pa = paRes.status === 'fulfilled' ? (paRes.value as PlayerLite) : null
  const pb = pbRes.status === 'fulfilled' ? (pbRes.value as PlayerLite) : null
  const brawlers = brawlersRes.status === 'fulfilled' ? brawlersRes.value.items : []

  if (!pa && !pb) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          <T k="compare.title" /> <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
        </h1>
        <DACard innerClassName="p-4 sm:p-5">
          <div className="text-white/85"><T k="compare.loadBothFail" /></div>
        </DACard>
      </div>
    )
  }

  if (!pa || !pb) {
    const ok = (pa || pb) as PlayerLite
    const missing = pa ? bUp : aUp
    const c = computeCompletion(ok, brawlers)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          <T k="compare.title" /> <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
        </h1>

        <DACard innerClassName="p-4 sm:p-5">
          <div className="text-white/85">
            <T k="compare.playerNotFound" /> <b>#{missing}</b>. <T k="compare.showingAvailable" />
          </div>
        </DACard>

        <div className="grid gap-4 sm:grid-cols-2">
          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <div className="text-white font-extrabold text-lg">
              {ok.name} <Chip>#{normTag(ok.tag)}</Chip>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label={<T k="player.trophies" />} value={ok.trophies} />
              <StatBadge label={<T k="player.highest" />} value={ok.highestTrophies} />
              <StatBadge label={<T k="player.level" />} value={ok.expLevel} />
              <StatBadge label={<T k="player.club" />} value={ok.club?.name ?? '—'} />
            </div>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-3">
            <div className="text-white font-bold"><T k="compare.completion" /></div>
            <TwoBars label={<T k="compare.ownedBrawlers" />} aName={ok.name} bName="—"
              aVal={c.ownedBrawlers} bVal={0} max={c.totalBrawlers} />
            <TwoBars label={<T k="brawler.starPowers" />} aName={ok.name} bName="—"
              aVal={c.starPowersOwned} bVal={0} max={c.starPowersTotal} />
            <TwoBars label={<T k="brawler.gadgets" />} aName={ok.name} bName="—"
              aVal={c.gadgetsOwned} bVal={0} max={c.gadgetsTotal} />
            <TwoBars label={<T k="compare.gearsEst" />} aName={ok.name} bName="—"
              aVal={c.gearsOwned} bVal={0} max={Math.max(c.gearsOwned, c.gearsTotal)} />
          </DACard>
        </div>
      </div>
    )
  }

  const ca = computeCompletion(pa, brawlers)
  const cb = computeCompletion(pb, brawlers)
  const sa = playerDeepStats(pa)
  const sb = playerDeepStats(pb)

  const headDelta = [
    { key: 'trophies', a: pa.trophies, b: pb.trophies },
    { key: 'highest', a: pa.highestTrophies, b: pb.highestTrophies },
    { key: 'level', a: pa.expLevel, b: pb.expLevel },
  ] as const

  const powerRank = [
    { key: 'avgPower', a: sa.avgPower, b: sb.avgPower },
    { key: 'maxPower', a: sa.maxPow, b: sb.maxPow },
    { key: 'avgRank', a: sa.avgRank, b: sb.avgRank },
    { key: 'maxRank', a: sa.maxRank, b: sb.maxRank },
  ] as const

  const milestones = [
    { key: 'power11', a: sa.power11, b: sb.power11, max: Math.max(sa.power11, sb.power11) || 1 },
    { key: 'power10plus', a: sa.power10, b: sb.power10, max: Math.max(sa.power10, sb.power10) || 1 },
    { key: 'power9plus', a: sa.power9m, b: sb.power9m, max: Math.max(sa.power9m, sb.power9m) || 1 },
    { key: 'rank30plus', a: sa.rank30, b: sb.rank30, max: Math.max(sa.rank30, sb.rank30) || 1 },
    { key: 'rank25plus', a: sa.rank25, b: sb.rank25, max: Math.max(sa.rank25, sb.rank25) || 1 },
    { key: 'rank20plus', a: sa.rank20, b: sb.rank20, max: Math.max(sa.rank20, sb.rank20) || 1 },
    { key: 'at500', a: sa.at500, b: sb.at500, max: Math.max(sa.at500, sb.at500) || 1 },
    { key: 'at600', a: sa.at600, b: sb.at600, max: Math.max(sa.at600, sb.at600) || 1 },
    { key: 'at750', a: sa.at750, b: sb.at750, max: Math.max(sa.at750, sb.at750) || 1 },
    { key: 'at1k', a: sa.at1k, b: sb.at1k, max: Math.max(sa.at1k, sb.at1k) || 1 },
  ] as const

  const comparisons: Array<{ key: string; a: number; b: number; better: Better }> = [
    ...headDelta.map(m => ({ key: `compare.labels.${m.key}`, a: m.a, b: m.b, better: 'higher' as const })),
    ...powerRank.map(m => ({ key: `compare.labels.${m.key}`, a: m.a, b: m.b, better: 'higher' as const })),
    ...milestones.map(m => ({ key: `compare.labels.${m.key}`, a: m.a, b: m.b, better: 'higher' as const })),
    { key: 'compare.labels.avgTrophiesPerBrawler', a: sa.avgBTroph, b: sb.avgBTroph, better: 'higher' },
    { key: 'compare.labels.p50PerBrawler', a: sa.p50, b: sb.p50, better: 'higher' },
    { key: 'compare.labels.p75PerBrawler', a: sa.p75, b: sb.p75, better: 'higher' },
    { key: 'compare.labels.p90PerBrawler', a: sa.p90, b: sb.p90, better: 'higher' },
    { key: 'compare.labels.totalGearsEquipped', a: sa.gearsOwned, b: sb.gearsOwned, better: 'higher' },
    { key: 'compare.labels.victories3v3', a: pa['3vs3Victories'] ?? 0, b: pb['3vs3Victories'] ?? 0, better: 'higher' },
  ]

  let aScore = 0, bScore = 0, ties = 0
  for (const c of comparisons) {
    if (c.a === c.b) { ties++; continue }
    const aWins = c.better === 'higher' ? c.a > c.b : c.a < c.b
    if (aWins) aScore++; else bScore++
  }

  const diff = Math.abs(aScore - bScore)
  const winnerName = aScore > bScore ? pa.name : bScore > aScore ? pb.name : null

  let verdictTitleNode: React.ReactNode = <><T k="compare.verdict.drawTitle" /> 🤝</>
  let verdictLineNode: React.ReactNode = <><T k="compare.verdict.drawLine" /> {aScore}–{bScore}.</>

  if (winnerName) {
    if (diff <= 2) {
      verdictTitleNode = <><T k="compare.verdict.edgePrefix" /> {winnerName} ✨</>
      verdictLineNode = <><T k="compare.verdict.tight" /> {aScore}–{bScore}.</>
    } else if (diff <= 5) {
      verdictTitleNode = <><T k="compare.verdict.hatPrefix" /> {winnerName} 🎉</>
      verdictLineNode = <>{winnerName} <T k="compare.verdict.leads" /> {aScore}–{bScore}.</>
    } else {
      verdictTitleNode = <><T k="compare.verdict.mvpPrefix" /> {winnerName} 👑</>
      verdictLineNode = <>{winnerName} <T k="compare.verdict.shines" /> {aScore}–{bScore}.</>
    }
  }

  const totalDuels = aScore + bScore
  const winnerPct = totalDuels ? Math.round(((aScore > bScore ? aScore : bScore) / totalDuels) * 100) : 50

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
        <T k="compare.title" /> <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
      </h1>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 text-white">
            <div className="text-lg font-extrabold">{pa.name} <Chip>#{normTag(pa.tag)}</Chip></div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label={<T k="player.trophies" />} value={pa.trophies} highlight={pa.trophies > pb.trophies} />
              <StatBadge label={<T k="player.highest" />} value={pa.highestTrophies} highlight={pa.highestTrophies > pb.highestTrophies} />
              <StatBadge label={<T k="player.level" />} value={pa.expLevel} highlight={pa.expLevel > pb.expLevel} />
              <StatBadge label={<T k="player.club" />} value={pa.club?.name ?? '—'} />
            </div>
            <div className="text-xs text-white/80">
              <Lnk className="underline decoration-2 underline-offset-2" href={`/player/${normTag(pa.tag)}`}><T k="common.seeProfile" /></Lnk>
            </div>
          </div>

          <div className="space-y-2 text-white">
            <div className="text-lg font-extrabold">{pb.name} <Chip>#{normTag(pb.tag)}</Chip></div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label={<T k="player.trophies" />} value={pb.trophies} highlight={pb.trophies > pa.trophies} />
              <StatBadge label={<T k="player.highest" />} value={pb.highestTrophies} highlight={pb.highestTrophies > pa.highestTrophies} />
              <StatBadge label={<T k="player.level" />} value={pb.expLevel} highlight={pb.expLevel > pa.expLevel} />
              <StatBadge label={<T k="player.club" />} value={pb.club?.name ?? '—'} />
            </div>
            <div className="text-xs text-white/80">
              <Lnk className="underline decoration-2 underline-offset-2" href={`/player/${normTag(pb.tag)}`}><T k="common.seeProfile" /></Lnk>
            </div>
          </div>
        </div>
      </DACard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DACard innerClassName="p-4 sm:p-5 space-y-4">
          <div className="text-white font-extrabold"><T k="compare.accountCompletion" /></div>
          <TwoBars
            label={<T k="compare.ownedBrawlers" />}
            aName={pa.name} bName={pb.name}
            aVal={ca.ownedBrawlers} bVal={cb.ownedBrawlers} max={Math.max(ca.totalBrawlers, cb.totalBrawlers)}
          />
          <TwoBars
            label={<T k="brawler.starPowers" />}
            aName={pa.name} bName={pb.name}
            aVal={ca.starPowersOwned} bVal={cb.starPowersOwned} max={Math.max(ca.starPowersTotal, cb.starPowersTotal)}
          />
          <TwoBars
            label={<T k="brawler.gadgets" />}
            aName={pa.name} bName={pb.name}
            aVal={ca.gadgetsOwned} bVal={cb.gadgetsOwned} max={Math.max(ca.gadgetsTotal, cb.gadgetsTotal)}
          />
          <TwoBars
            label={<T k="compare.gearsEst" />}
            aName={pa.name} bName={pb.name}
            aVal={ca.gearsOwned} bVal={cb.gearsOwned} max={Math.max(ca.gearsTotal, cb.gearsTotal, ca.gearsOwned, cb.gearsOwned)}
          />
        </DACard>

        <DACard innerClassName="p-4 sm:p-5 space-y-4">
          <div className="text-white font-extrabold"><T k="compare.headToHead" /></div>
          <div className="grid grid-cols-3 gap-3 text-white">
            {headDelta.map((m) => {
              const d = deltaLabel(m.a, m.b)
              return (
                <div key={m.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white/70 text-sm"><T k={`compare.labels.${m.key}`} /></div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="font-extrabold">{m.a}</div>
                    <div className="text-white/80">vs</div>
                    <div className="font-extrabold">{m.b}</div>
                  </div>
                  <div className={`mt-1 text-sm font-bold ${d.cls}`}>{d.txt}</div>
                </div>
              )
            })}
          </div>
        </DACard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DACard innerClassName="p-4 sm:p-5 space-y-3">
          <div className="text-white font-extrabold"><T k="compare.powerRank" /></div>
          <div className="grid gap-3">
            {powerRank.map(m => (
              <TwoBars
                key={m.key}
                label={<T k={`compare.labels.${m.key}`} />}
                aName={pa.name}
                bName={pb.name}
                aVal={m.a}
                bVal={m.b}
                max={Math.max(m.a, m.b) || 1}
              />
            ))}
          </div>
        </DACard>

        <DACard innerClassName="p-4 sm:p-5 space-y-3">
          <div className="text-white font-extrabold"><T k="compare.milestones" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {milestones.map(m => (
              <TwoBars
                key={m.key}
                label={<T k={`compare.labels.${m.key}`} />}
                aName={pa.name}
                bName={pb.name}
                aVal={m.a}
                bVal={m.b}
                max={m.max}
              />
            ))}
          </div>
        </DACard>
      </div>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DualStat
            label={<T k="compare.labels.avgTrophiesPerBrawler" />}
            aName={pa.name} bName={pb.name}
            aVal={sa.avgBTroph} bVal={sb.avgBTroph}
          />
          <DualStat
            label={<T k="compare.labels.p50PerBrawler" />}
            aName={pa.name} bName={pb.name}
            aVal={sa.p50} bVal={sb.p50}
          />
          <DualStat
            label={<T k="compare.labels.p75PerBrawler" />}
            aName={pa.name} bName={pb.name}
            aVal={sa.p75} bVal={sb.p75}
          />
          <DualStat
            label={<T k="compare.labels.p90PerBrawler" />}
            aName={pa.name} bName={pb.name}
            aVal={sa.p90} bVal={sb.p90}
          />
          <DualStat
            label={<T k="compare.labels.totalGearsEquipped" />}
            aName={pa.name} bName={pb.name}
            aVal={sa.gearsOwned} bVal={sb.gearsOwned}
          />
          <DualStat
            label={<T k="compare.labels.victories3v3" />}
            aName={pa.name} bName={pb.name}
            aVal={pa['3vs3Victories'] ?? 0}
            bVal={pb['3vs3Victories'] ?? 0}
          />
        </div>
      </DACard>

      <DACard innerClassName="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-white font-extrabold text-lg drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            <T k="compare.miniSummary" />
          </div>
          <div className="text-xs text-white/80">
            <T k="compare.basedOn" /> {totalDuels + ties} <T k="compare.indicators" /> (<T k="compare.ties" />: {ties})
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-sm font-black text-black shadow-[0_2px_0_#000]">
            {verdictTitleNode}
          </span>
          <div className="text-white/90">{verdictLineNode}</div>
        </div>

        {winnerName && (
          <div className="mt-2">
            <div className="mb-1 text-xs text-white/70">
              <T k="compare.globalScore" /> : <b className="text-white">{aScore}</b> – <b className="text-white">{bScore}</b>
            </div>
            <Progress value={winnerPct} className="h-3" indicatorClassName="" />
            <div className="mt-1 text-[11px] text-white/60">
              <T k="compare.gaugeHint" />
            </div>
          </div>
        )}
      </DACard>
    </div>
  )
}
