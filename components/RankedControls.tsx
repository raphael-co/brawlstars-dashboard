'use client'
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useTransition } from 'react'

export default function RankedControls({
    countries,
    country,
    kind,
    brawlers,
    brawlerId,
}: {
    countries: string[]
    country: string
    kind: 'players' | 'clubs' | 'brawlers'
    brawlers: Array<{ id: string; name: string }>
    brawlerId?: string
}) {
    const router = useRouter()
    const sp = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const set = (next: Partial<{ country: string; kind: string; brawlerId?: string }>) => {
        const params = new URLSearchParams(sp?.toString() ?? '')
        if (next.country) params.set('country', next.country)
        if (next.kind) params.set('kind', next.kind)
        if (next.kind !== 'brawlers') {
            params.delete('brawlerId')
        } else if (next.brawlerId) {
            params.set('brawlerId', next.brawlerId)
        }
        startTransition(() => {
            const href = `/ranked?${params.toString()}` as Route;
            router.replace(href);
        })
    }

    const bOpts = useMemo(() => {
        return brawlers.slice(0).sort((a, b) => a.name.localeCompare(b.name))
    }, [brawlers])

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
                <div className="text-xs text-white/70">Pays</div>
                <select
                    value={country}
                    onChange={(e) => set({ country: e.target.value })}
                    className="w-full rounded-md border-2 border-black bg-white px-2 py-1.5 text-sm font-semibold text-black shadow-[0_2px_0_#000] focus:bg-white focus:text-black"
                >
                    {countries.map((c) => (
                        <option key={c} value={c} className="text-black bg-white">
                            {c.toUpperCase()}
                        </option>
                    ))}
                </select>

            </div>

            <div className="space-y-1">
                <div className="text-xs text-white/70">Catégorie</div>
                <div className="grid grid-cols-3 gap-2">
                    {(['players', 'clubs', 'brawlers'] as const).map(k => (
                        <button
                            key={k}
                            onClick={() => set({ kind: k })}
                            className={[
                                "rounded-md border-2 border-black px-2 py-1.5 text-sm font-extrabold shadow-[0_2px_0_#000]",
                                k === kind ? "bg-gradient-to-b from-yellow-300 to-amber-400 text-black" : "bg-white/80 text-black/80"
                            ].join(' ')}
                        >
                            {k === 'players' ? 'Joueurs' : k === 'clubs' ? 'Clubs' : 'Brawlers'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-xs text-white/70">Brawler</div>
                <select
                    disabled={kind !== 'brawlers'}
                    value={brawlerId ?? ''}
                    onChange={(e) => set({ kind: 'brawlers', brawlerId: e.target.value })}
                    className={[
                        "w-full rounded-md border-2 border-black px-2 py-1.5 text-sm font-semibold shadow-[0_2px_0_#000]",
                        kind !== 'brawlers' ? "bg-white/50 text-black/50 cursor-not-allowed" : "bg-white/90"
                    ].join(' ')}
                >
                    {bOpts.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            {isPending && (
                <div className="col-span-full text-xs text-white/70">Mise à jour…</div>
            )}
        </div>
    )
}
