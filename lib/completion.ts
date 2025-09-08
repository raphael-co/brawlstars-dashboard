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

  console.log("=== RAW BRAWLERS LIST ===")
  console.log(`Total brut: ${items?.length ?? 0}`)

  for (const raw of items ?? []) {
    const id = Number(raw?.id)
    const name = String(raw?.name ?? '')
    const released = raw?.released
    const spCount = Array.isArray(raw?.starPowers) ? raw.starPowers.length : 0
    const gCount  = Array.isArray(raw?.gadgets) ? raw.gadgets.length : 0

    console.log(raw);
    
    // Log l'entrée brute
    console.log({
      id,
      name,
      released,
      spCount,
      gCount,
      raw
    })

    // Filtrage avec logs explicites
    if (!Number.isFinite(id)) {
      console.log(`⛔ Ignoré ${name} → ID invalide`)
      continue
    }
    if (id < 16000000) {
      console.log(`⛔ Ignoré ${name} → ID hors plage brawler`)
      continue
    }
    if (!name.trim()) {
      console.log(`⛔ Ignoré ${id} → Nom vide`)
      continue
    }
    if (typeof released === 'boolean' && released === false) {
      console.log(`⛔ Ignoré ${name} → Non sorti`)
      continue
    }
    if (/npc|boss|test/i.test(name)) {
      console.log(`⛔ Ignoré ${name} → NPC/Boss/Test`)
      continue
    }
    if (spCount + gCount === 0) {
      console.log(`⛔ Ignoré ${name} → Aucun SP ni gadget`)
      continue
    }
    if (seen.has(id)) {
      console.log(`⛔ Ignoré ${name} → Doublon`)
      continue
    }

    seen.add(id)
    out.push(raw as Brawler)
  }

  console.log(`Total après filtrage: ${out.length}`)
  console.log("=========================")

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

  // 2 emplacements par brawler jouable (valeur plafond utilisée pour la complétion)
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
