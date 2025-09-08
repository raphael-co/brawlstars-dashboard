import type { Player, Brawler } from '@/lib/brawl'

export type Completion = {
  totalBrawlers: number
  ownedBrawlers: number
  brawlersCompletion: number
  starPowersOwned: number
  starPowersTotal: number
  gadgetsOwned: number
  gadgetsTotal: number
  gearsOwned: number
  gearsTotal: number
}

function sanitizeBrawlers(items: any[]): Brawler[] {
  const seen = new Set<number>()
  const out: Brawler[] = []

  for (const raw of items ?? []) {
    const id = Number(raw?.id)

    seen.add(id)
    out.push(raw as Brawler)
  }


  return out
}


export function computeCompletion(player: Player, allRaw: Brawler[]): Completion {
  const all = sanitizeBrawlers(allRaw)

  const totalBrawlers = all.length
  const ownedBrawlers = player.brawlers.length

  let starPowersOwned = 0, starPowersTotal = 0
  let gadgetsOwned = 0, gadgetsTotal = 0
  let gearsOwned = 0, gearsTotal = 0

  for (const b of all) {
    starPowersTotal += b.starPowers?.length ?? 0
    gadgetsTotal    += b.gadgets?.length ?? 0
  }
  for (const pb of player.brawlers) {
    starPowersOwned += pb.starPowers?.length ?? 0
    gadgetsOwned    += pb.gadgets?.length ?? 0
    gearsOwned      += pb.gears?.length ?? 0
  }

  gearsTotal = Math.max(gearsTotal, all.length * 2)

  const brawlersCompletion = totalBrawlers
    ? Math.round((ownedBrawlers / totalBrawlers) * 100)
    : 0

  return {
    totalBrawlers,
    ownedBrawlers,
    brawlersCompletion,
    starPowersOwned,
    starPowersTotal,
    gadgetsOwned,
    gadgetsTotal,
    gearsOwned,
    gearsTotal,
  }
}
