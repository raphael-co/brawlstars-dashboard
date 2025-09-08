import { headers } from 'next/headers'

export type Player = {
  tag: string
  name: string
  icon?: { id: number }
  trophies: number
  highestTrophies: number
  expLevel: number
  expPoints: number
  '3vs3Victories'?: number
  soloVictories?: number
  duoVictories?: number
  bestRoboRumbleTime?: number
  bestTimeAsBigBrawler?: number
  club?: { tag: string; name: string }
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

export type Brawler = {
  id: number
  name: string
  starPowers: Array<{ id: number; name: string }>
  gadgets: Array<{ id: number; name: string }>
}

export type BattleLog = { items: Array<any> }

function normalizeTag(tagOrName: string) {
  let s = tagOrName.trim()
  s = s.replace(/^%23/, '').replace(/^#/, '').toUpperCase()
  return s
}

let cachedBase = '' // memoize pour éviter headers() multiples
async function getBaseUrl(): Promise<string> {
  // Client → les routes /api sont accessibles en relatif
  if (typeof window !== 'undefined') return ''
  if (cachedBase) return cachedBase

  // 1) Déduire depuis les en-têtes de la requête courante (RSC/SSR)
  try {
    const h = await headers() // Next 15: asynchrone
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? 'http'
    if (host) {
      cachedBase = `${proto}://${host}`
      return cachedBase
    }
  } catch {
    // headers() non dispo (exécution hors requête) → fallback
  }

  // 2) Fallback env (ex: Vercel) ou localhost
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  cachedBase = envUrl
  return cachedBase
}

type NextishInit = RequestInit & { next?: { revalidate?: number } }
type FetchOpts = { allow404?: boolean }

async function doFetch<T = any>(path: string, init?: NextishInit, opts?: FetchOpts): Promise<T> {
  const base = await getBaseUrl()
  const url = base ? `${base}${path}` : path
  const res = await fetch(url, init)

  if (!res.ok) {
    // Si on autorise le 404, retourner null au lieu d'exploser
    if (res.status === 404 && opts?.allow404) {
      try {
        // Consommer le body pour éviter les warnings, mais on renvoie null
        await res.text()
      } catch {}
      return null as unknown as T
    }
    const text = await res.text()
    throw new Error(text || `Request failed ${res.status}`)
  }

  // T peut être null si allow404, mais dans la branche ok on parse
  return res.json() as Promise<T>
}

export async function getPlayer(tagOrName: string): Promise<Player> {
  const tag = normalizeTag(tagOrName)
  return doFetch<Player>(`/api/players/${tag}`, { cache: 'no-store' })
}

// Variante « safe » qui ne jette pas si le joueur n'existe pas
export async function getPlayerSafe(tagOrName: string): Promise<Player | null> {
  const tag = normalizeTag(tagOrName)
  return doFetch<Player | null>(`/api/players/${tag}`, { cache: 'no-store' }, { allow404: true })
}

export async function getBattleLog(tagOrName: string): Promise<BattleLog> {
  const tag = normalizeTag(tagOrName)
  return doFetch<BattleLog>(`/api/players/${tag}/battlelog`, { cache: 'no-store' })
}

export async function getBrawlers(): Promise<{ items: Brawler[] }> {
  return doFetch<{ items: Brawler[] }>(`/api/brawlers`, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  })
}

export async function getBrawler(id: string) {
  return doFetch<Brawler>(`/api/brawlers/${id}`, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  })
}

export async function getClub(tagOrName: string) {
  const tag = normalizeTag(tagOrName)
  return doFetch(`/api/clubs/${tag}`, { cache: 'no-store' })
}

export async function getRankings(
  country: string,
  kind: 'players' | 'clubs' | 'brawlers',
  brawlerId?: string
) {
  const qs = new URLSearchParams()
  if (brawlerId) qs.set('brawlerId', brawlerId)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return doFetch(`/api/rankings/${country}/${kind}${query}`, { cache: 'no-store' })
}

export async function getEvents() {
  return doFetch(`/api/events`, { cache: 'no-store' })
}

// Skins via notre proxy /api pour homogénéité
export async function getCosmetics() {
  try {
    return await doFetch(`/api/cosmetics/skins`, {
      cache: 'force-cache',
      next: { revalidate: 86400 },
    })
  } catch {
    return null
  }
}

export async function getBrawlerAssets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brawlers/brawler-assets`, {
    cache: 'force-cache', // ok pour des images stables
    next: { revalidate: 60 * 60 * 24 },
  })
  if (!res.ok) throw new Error('Failed to load brawler assets')
  return res.json() as Promise<{ items: Array<{ id: number; name: string; imageUrl?: string|null; imageUrl2?: string|null }> }>
}