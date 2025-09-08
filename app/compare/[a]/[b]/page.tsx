import { getPlayer, getBrawlers } from '@/lib/brawl'
import { computeCompletion } from '@/lib/completion'
import { DACard } from '@/components/DACard'
import { Progress } from '@/components/Progress'
import Link from 'next/link'

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

function StatBadge({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
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
  label: string
  aName: string
  bName: string
  aVal: number
  bVal: number
}) {
  const d = aVal - bVal
  const leader =
    d > 0 ? aName : d < 0 ? bName : 'Égalité'
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
        <span className="text-white/70">Delta</span>
        <span className={[
          "inline-flex items-center rounded-md border-2 border-black px-2 py-0.5 font-black text-black shadow-[0_2px_0_#000]",
          badgeCls,
        ].join(" ")}>
          {d > 0 ? `+${d}` : d}
        </span>
      </div>

      <div className="mt-1 text-right text-xs text-white/75">
        Leader : <span className="font-semibold">{leader}</span>
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
  label: string
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
          Comparatif <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
        </h1>
        <DACard innerClassName="p-4 sm:p-5">
          <div className="text-white/85">Impossible de charger les deux joueurs.</div>
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
          Comparatif <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
        </h1>

        <DACard innerClassName="p-4 sm:p-5">
          <div className="text-white/85">Joueur <b>#{missing}</b> introuvable. Affichage du joueur disponible.</div>
        </DACard>

        <div className="grid gap-4 sm:grid-cols-2">
          <DACard innerClassName="p-4 sm:p-5 space-y-2">
            <div className="text-white font-extrabold text-lg">{ok.name} <Chip>#{normTag(ok.tag)}</Chip></div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label="Trophées" value={ok.trophies} />
              <StatBadge label="Record" value={ok.highestTrophies} />
              <StatBadge label="Niveau" value={ok.expLevel} />
              <StatBadge label="Club" value={ok.club?.name ?? '—'} />
            </div>
          </DACard>

          <DACard innerClassName="p-4 sm:p-5 space-y-3">
            <div className="text-white font-bold">Complétion</div>
            <TwoBars label="Brawlers possédés" aName={ok.name} bName="—"
              aVal={c.ownedBrawlers} bVal={0} max={c.totalBrawlers} />
            <TwoBars label="Star Powers" aName={ok.name} bName="—"
              aVal={c.starPowersOwned} bVal={0} max={c.starPowersTotal} />
            <TwoBars label="Gadgets" aName={ok.name} bName="—"
              aVal={c.gadgetsOwned} bVal={0} max={c.gadgetsTotal} />
            <TwoBars label="Gears (est.)" aName={ok.name} bName="—"
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
    { label: 'Trophées', a: pa.trophies, b: pb.trophies },
    { label: 'Record', a: pa.highestTrophies, b: pb.highestTrophies },
    { label: 'Niveau', a: pa.expLevel, b: pb.expLevel },
  ]

  const powerRank = [
    { label: 'Puissance moyenne', a: sa.avgPower, b: sb.avgPower },
    { label: 'Puissance max', a: sa.maxPow, b: sb.maxPow },
    { label: 'Rang moyen', a: sa.avgRank, b: sb.avgRank },
    { label: 'Rang max', a: sa.maxRank, b: sb.maxRank },
  ]

  const milestones = [
    { label: 'Power 11', a: sa.power11, b: sb.power11, max: Math.max(sa.power11, sb.power11) || 1 },
    { label: 'Power 10+', a: sa.power10, b: sb.power10, max: Math.max(sa.power10, sb.power10) || 1 },
    { label: 'Power 9+', a: sa.power9m, b: sb.power9m, max: Math.max(sa.power9m, sb.power9m) || 1 },
    { label: 'Rang 30+', a: sa.rank30, b: sb.rank30, max: Math.max(sa.rank30, sb.rank30) || 1 },
    { label: 'Rang 25+', a: sa.rank25, b: sb.rank25, max: Math.max(sa.rank25, sb.rank25) || 1 },
    { label: 'Rang 20+', a: sa.rank20, b: sb.rank20, max: Math.max(sa.rank20, sb.rank20) || 1 },
    { label: '≥500 trophées', a: sa.at500, b: sb.at500, max: Math.max(sa.at500, sb.at500) || 1 },
    { label: '≥600 trophées', a: sa.at600, b: sb.at600, max: Math.max(sa.at600, sb.at600) || 1 },
    { label: '≥750 trophées', a: sa.at750, b: sb.at750, max: Math.max(sa.at750, sb.at750) || 1 },
    { label: '≥1000 trophées', a: sa.at1k, b: sb.at1k, max: Math.max(sa.at1k, sb.at1k) || 1 },
  ]

  type Better = 'higher' | 'lower'

  const comparisons: Array<{ label: string; a: number; b: number; better: Better }> = [
    ...headDelta.map(m => ({ label: m.label, a: m.a, b: m.b, better: 'higher' as const })),
    ...powerRank.map(m => ({ label: m.label, a: m.a, b: m.b, better: 'higher' as const })),
    ...milestones.map(m => ({ label: m.label, a: m.a, b: m.b, better: 'higher' as const })),
    { label: 'Trophées moyens / brawler', a: sa.avgBTroph, b: sb.avgBTroph, better: 'higher' },
    { label: 'Médiane (p50) / brawler', a: sa.p50, b: sb.p50, better: 'higher' },
    { label: 'p75 / brawler', a: sa.p75, b: sb.p75, better: 'higher' },
    { label: 'p90 / brawler', a: sa.p90, b: sb.p90, better: 'higher' },
    { label: 'Total gears portés', a: sa.gearsOwned, b: sb.gearsOwned, better: 'higher' },
    { label: 'Victoires 3v3', a: pa['3vs3Victories'] ?? 0, b: pb['3vs3Victories'] ?? 0, better: 'higher' },
  ]

  let aScore = 0, bScore = 0, ties = 0
  for (const c of comparisons) {
    if (c.a === c.b) { ties++; continue }
    const aWins = c.better === 'higher' ? c.a > c.b : c.a < c.b
    if (aWins) aScore++; else bScore++
  }

  const diff = Math.abs(aScore - bScore)
  const winnerName = aScore > bScore ? pa.name : bScore > aScore ? pb.name : null

  let verdictTitle = 'Match nul 🤝'
  let verdictLine = `Égalité parfaite : ${aScore}–${bScore}. Beau duel !`

  if (winnerName) {
    if (diff <= 2) {
      verdictTitle = `Avantage ${winnerName} ✨`
      verdictLine = `C’était serré : ${aScore}–${bScore}.`
    } else if (diff <= 5) {
      verdictTitle = `Coup de chapeau à ${winnerName} 🎉`
      verdictLine = `${winnerName} mène ${aScore}–${bScore}.`
    } else {
      verdictTitle = `MVP du jour : ${winnerName} 👑`
      verdictLine = `${winnerName} s’illustre ${aScore}–${bScore}.`
    }
  }

  const totalDuels = aScore + bScore
  const winnerPct = totalDuels ? Math.round(((aScore > bScore ? aScore : bScore) / totalDuels) * 100) : 50


  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
        Comparatif <Chip>#{aUp}</Chip> ↔ <Chip>#{bUp}</Chip>
      </h1>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 text-white">
            <div className="text-lg font-extrabold">{pa.name} <Chip>#{normTag(pa.tag)}</Chip></div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label="Trophées" value={pa.trophies} highlight={pa.trophies > pb.trophies} />
              <StatBadge label="Record" value={pa.highestTrophies} highlight={pa.highestTrophies > pb.highestTrophies} />
              <StatBadge label="Niveau" value={pa.expLevel} highlight={pa.expLevel > pb.expLevel} />
              <StatBadge label="Club" value={pa.club?.name ?? '—'} />
            </div>
            <div className="text-xs text-white/80">
              <Link className="underline decoration-2 underline-offset-2" href={`/player/${normTag(pa.tag)}`}>Voir le profil</Link>
            </div>
          </div>

          <div className="space-y-2 text-white">
            <div className="text-lg font-extrabold">{pb.name} <Chip>#{normTag(pb.tag)}</Chip></div>
            <div className="grid grid-cols-2 gap-3">
              <StatBadge label="Trophées" value={pb.trophies} highlight={pb.trophies > pa.trophies} />
              <StatBadge label="Record" value={pb.highestTrophies} highlight={pb.highestTrophies > pa.highestTrophies} />
              <StatBadge label="Niveau" value={pb.expLevel} highlight={pb.expLevel > pa.expLevel} />
              <StatBadge label="Club" value={pb.club?.name ?? '—'} />
            </div>
            <div className="text-xs text-white/80">
              <Link className="underline decoration-2 underline-offset-2" href={`/player/${normTag(pb.tag)}`}>Voir le profil</Link>
            </div>
          </div>
        </div>
      </DACard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DACard innerClassName="p-4 sm:p-5 space-y-4">
          <div className="text-white font-extrabold">Complétion du compte</div>
          <TwoBars
            label="Brawlers possédés"
            aName={pa.name} bName={pb.name}
            aVal={ca.ownedBrawlers} bVal={cb.ownedBrawlers} max={Math.max(ca.totalBrawlers, cb.totalBrawlers)}
          />
          <TwoBars
            label="Star Powers"
            aName={pa.name} bName={pb.name}
            aVal={ca.starPowersOwned} bVal={cb.starPowersOwned} max={Math.max(ca.starPowersTotal, cb.starPowersTotal)}
          />
          <TwoBars
            label="Gadgets"
            aName={pa.name} bName={pb.name}
            aVal={ca.gadgetsOwned} bVal={cb.gadgetsOwned} max={Math.max(ca.gadgetsTotal, cb.gadgetsTotal)}
          />
          <TwoBars
            label="Gears (est.)"
            aName={pa.name} bName={pb.name}
            aVal={ca.gearsOwned} bVal={cb.gearsOwned} max={Math.max(ca.gearsTotal, cb.gearsTotal, ca.gearsOwned, cb.gearsOwned)}
          />
        </DACard>

        <DACard innerClassName="p-4 sm:p-5 space-y-4">
          <div className="text-white font-extrabold">Résumé head-to-head</div>
          <div className="grid grid-cols-3 gap-3 text-white">
            {headDelta.map((m) => {
              const d = deltaLabel(m.a, m.b)
              return (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white/70 text-sm">{m.label}</div>
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
          <div className="text-white font-extrabold">Puissance & rang</div>
          <div className="grid gap-3">
            {powerRank.map(m => (
              <TwoBars
                key={m.label}
                label={m.label}
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
          <div className="text-white font-extrabold">Paliers importants</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {milestones.map(m => (
              <TwoBars
                key={m.label}
                label={m.label}
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
            label="Trophées moyens / brawler"
            aName={pa.name} bName={pb.name}
            aVal={sa.avgBTroph} bVal={sb.avgBTroph}
          />
          <DualStat
            label="Médiane (p50) / brawler"
            aName={pa.name} bName={pb.name}
            aVal={sa.p50} bVal={sb.p50}
          />
          <DualStat
            label="p75 / brawler"
            aName={pa.name} bName={pb.name}
            aVal={sa.p75} bVal={sb.p75}
          />
          <DualStat
            label="p90 / brawler"
            aName={pa.name} bName={pb.name}
            aVal={sa.p90} bVal={sb.p90}
          />
          <DualStat
            label="Total gears portés"
            aName={pa.name} bName={pb.name}
            aVal={sa.gearsOwned} bVal={sb.gearsOwned}
          />
          <DualStat
            label="Victoires 3v3"
            aName={pa.name} bName={pb.name}
            aVal={pa['3vs3Victories'] ?? 0}
            bVal={pb['3vs3Victories'] ?? 0}
          />
        </div>
      </DACard>

      <DACard innerClassName="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-white font-extrabold text-lg drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            Petit bilan du comparatif
          </div>
          <div className="text-xs text-white/80">
            Basé sur {totalDuels + ties} indicateurs (égalités : {ties})
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-sm font-black text-black shadow-[0_2px_0_#000]">
            {verdictTitle}
          </span>
          <div className="text-white/90">{verdictLine}</div>
        </div>

        {winnerName && (
          <div className="mt-2">
            <div className="mb-1 text-xs text-white/70">
              Score global&nbsp;: <b className="text-white">{aScore}</b> – <b className="text-white">{bScore}</b>
            </div>
            <Progress
              value={winnerPct}
              className="h-3"
              indicatorClassName=""
            />
            <div className="mt-1 text-[11px] text-white/60">
              La jauge reflète la part d’indicateurs en faveur du joueur en tête (hors égalités).
            </div>
          </div>
        )}
      </DACard>


    </div>
  )
}
