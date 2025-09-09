import Link from 'next/link'
import { Suspense } from 'react'
import { DACard } from '@/components/DACard'
import RankedControls from '@/components/RankedControls'
import { getBrawlers, getPlayer } from '@/lib/brawl'
import { Lnk } from "@/components/Lnk";
import T from "@/components/T";

export const dynamic = 'force-dynamic'

type Search = { country?: string; kind?: 'players' | 'clubs' | 'brawlers'; brawlerId?: string }

async function fetchRankings(country: string, kind: 'players' | 'clubs' | 'brawlers', brawlerId?: string) {
  const path =
    kind === 'brawlers' && brawlerId
      ? `/api/rankings/${country}/brawlers/${encodeURIComponent(brawlerId)}`
      : `/api/rankings/${country}/${kind}`;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('rankings fetch failed');
  return res.json();
}

function valOf(x: any): number {
  return Number(x?.trophies ?? x?.trophy ?? x?.score ?? x?.value ?? 0) || 0
}
function flagEmoji(cc: string) {
  const c = cc.toUpperCase()
  if (c === 'GLOBAL') return '🌍'
  if (!/^[A-Z]{2}$/.test(c)) return '🏳️'
  const codePoints = [...c].map(ch => 0x1F1E6 - 65 + ch.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

function ControlsFallback() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 animate-pulse">
      <div className="space-y-1">
        <div className="h-3 w-16 bg-white/20 rounded" />
        <div className="h-9 bg-white/10 rounded-md border-2 border-black shadow-[0_2px_0_#000]" />
      </div>
      <div className="space-y-1">
        <div className="h-3 w-20 bg-white/20 rounded" />
        <div className="h-9 bg-white/10 rounded-md border-2 border-black shadow-[0_2px_0_#000]" />
      </div>
      <div className="space-y-1">
        <div className="h-3 w-16 bg-white/20 rounded" />
        <div className="h-9 bg-white/10 rounded-md border-2 border-black shadow-[0_2px_0_#000]" />
      </div>
    </div>
  )
}

export default async function RankedPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams

  const country = (sp?.country ?? 'global').toLowerCase()
  const kind = (sp?.kind ?? 'players') as 'players' | 'clubs' | 'brawlers'

  const brawlers = await getBrawlers().then(r => r?.items ?? []).catch(() => [])
  const defaultBrawlerId = (brawlers[0]?.id ?? 16000000).toString()
  const brawlerId = kind === 'brawlers'
    ? (sp?.brawlerId ?? defaultBrawlerId)
    : undefined

  const data = await fetchRankings(country, kind, brawlerId).catch(() => ({ items: [] }))
  const items: any[] = Array.isArray(data?.items) ? data.items : []

  if (kind !== 'clubs' && items.length) {
    const suspects = items
      .map((it, idx) => {
        const rawTag = String(it?.tag ?? it?.player?.tag ?? '')
        const tag = rawTag.replace(/^%23|^#/, '').toUpperCase()
        const score = Number(it?.trophies ?? it?.trophy ?? it?.score ?? it?.value ?? 0) || 0
        return { idx, tag, score }
      })
      .filter(x => x.score <= 1 && x.tag)
      .slice(0, 50)

    if (suspects.length) {
      const results = await Promise.allSettled(
        suspects.map(async s => {
          const p = await getPlayer(s.tag).catch(() => null)
          return { idx: s.idx, trophies: p?.trophies ?? 0 }
        })
      )
      for (const r of results) {
        if (r.status === 'fulfilled') {
          const { idx, trophies } = r.value
          if (trophies > 1) items[idx] = { ...items[idx], trophies }
        }
      }
    }
  }

  const currentBrawler = brawlers.find((b: any) => String(b.id) === String(brawlerId))

  // Titres i18n (ReactNode)
  const titleNode =
    kind === 'players' ? <T k="rankings.topPlayers" />
      : kind === 'clubs' ? <T k="rankings.topClubs" />
        : (<>{/* Top players — {name} */}
          <T k="rankings.topPlayersForBrawlerPrefix" />{' '}
          {currentBrawler?.name ?? <T k="brawler.unknown" />}
        </>)

  const scoreLabelNode = kind === 'clubs'
    ? <T k="rankings.labels.points" />
    : <T k="rankings.labels.trophies" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
          <T k="rankings.title" />
        </h1>
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white/10 px-2 py-1 text-xs font-semibold text-white/90 shadow-[0_2px_0_#000]">
          <span className="text-base leading-none">{flagEmoji(country)}</span>
          <span className="uppercase tracking-wide">{country}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white/10 px-2 py-1 text-xs font-semibold text-white/90 shadow-[0_2px_0_#000]">
          <span className="uppercase tracking-wide">
            <T k={`rankings.kinds.${kind}`} />
          </span>
        </span>
        {kind === 'brawlers' && (
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-1 text-xs font-black text-black shadow-[0_2px_0_#000]">
            {currentBrawler?.name ?? <T k="brawler.unknown" />}
          </span>
        )}
      </div>

      <DACard innerClassName="p-4 sm:p-5" animated={false}>
        <Suspense fallback={<ControlsFallback />}>
          <RankedControls
            countries={['global', 'fr', 'us', 'de', 'gb', 'es', 'it', 'br', 'in', 'jp', 'kr']}
            country={country}
            kind={kind}
            brawlers={brawlers.map((b: any) => ({ id: String(b.id), name: b.name }))}
            brawlerId={brawlerId}
          />
        </Suspense>
      </DACard>

      <DACard innerClassName="p-4 sm:p-5 space-y-4" animated={false}>
        <div className="flex items-center justify-between">
          <div className="text-white font-extrabold">{titleNode}</div>
          <div className="text-xs text-white/75">
            {items.length} <T k="rankings.entries" />
          </div>
        </div>

        <div role="list" className="grid gap-3">
          {items.map((it, i) => {
            const rank = i + 1
            const name = it?.name ?? it?.player?.name ?? it?.club?.name ?? '—'
            const tagRaw = String(it?.tag ?? it?.player?.tag ?? it?.club?.tag ?? '')
            const tag = tagRaw.replace(/^#/, '').toUpperCase()
            const score = valOf(it)
            const href =
              kind === 'clubs'
                ? (tag ? `/club/${encodeURIComponent(tag)}` : undefined)
                : (tag ? `/player/${encodeURIComponent(tag)}` : undefined)

            const medalCls =
              rank === 1 ? "from-yellow-300 to-amber-500"
                : rank === 2 ? "from-zinc-200 to-zinc-400"
                  : rank === 3 ? "from-amber-700 to-amber-900"
                    : "from-white to-white/80"

            const Content = (
              <article
                className={[
                  "group relative rounded-xl border-2 border-black bg-white/5 p-3 shadow-[0_4px_0_#000] hover:-translate-y-0.5 transition",
                  "grid grid-cols-[auto,1fr,auto] items-center gap-3"
                ].join(" ")}
                role="listitem"
              >
                <div className={[
                  "grid h-10 w-10 place-items-center rounded-lg border-2 border-black",
                  "bg-gradient-to-b font-black text-black shadow-[0_3px_0_#000]",
                  rank <= 3 ? `bg-gradient-to-b ${medalCls}` : "bg-white"
                ].join(" ")}
                >
                  {rank}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-extrabold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-white/70">
                    <span className="opacity-90">{scoreLabelNode} :</span>
                    <span className="text-white/90 font-semibold">{fmt(score)}</span>
                    <span className="opacity-40">•</span>
                    <span className="uppercase">{country}</span>
                    {(kind === 'players' || kind === 'brawlers') && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="text-white/70">{tag ? `#${tag}` : '—'}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white text-lg font-extrabold leading-none">{fmt(score)}</div>
                  <div className="text-[11px] text-white/70">{scoreLabelNode}</div>
                  {href && (
                    <div className="mt-1 text-[11px] text-white/80 underline decoration-2 underline-offset-2 opacity-0 group-hover:opacity-100 transition">
                      <T k="rankings.view" />
                    </div>
                  )}
                </div>
              </article>
            )

            return href ? (
              <Lnk key={`${tag || name}-${i}`} href={href as any} className="block">
                {Content}
              </Lnk>
            ) : (
              <div key={`${tag || name}-${i}`}>{Content}</div>
            )
          })}

          {!items.length && (
            <div className="col-span-full rounded-xl border-2 border-black bg-white/5 p-4 text-white/80 shadow-[0_3px_0_#000]">
              <T k="rankings.noResults" />
            </div>
          )}
        </div>
      </DACard>
    </div>
  )
}
