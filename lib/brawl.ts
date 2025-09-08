import { headers } from "next/headers";

export type Player = {
  tag: string;
  name: string;
  icon?: { id: number };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  "3vs3Victories"?: number;
  soloVictories?: number;
  duoVictories?: number;
  bestRoboRumbleTime?: number;
  bestTimeAsBigBrawler?: number;
  club?: { tag: string; name: string };
  brawlers: Array<{
    id: number;
    name: string;
    power: number;
    rank: number;
    trophies: number;
    highestTrophies: number;
    starPowers: Array<{ id: number; name: string }>;
    gadgets: Array<{ id: number; name: string }>;
    gears?: Array<{ id: number; name: string }>;
  }>;
};

export type Brawler = {
  id: number;
  name: string;
  starPowers: Array<{ id: number; name: string }>;
  gadgets: Array<{ id: number; name: string }>;
};

export type BattleLog = { items: Array<any> };

function normalizeTag(tagOrName: string) {
  let s = tagOrName.trim();
  s = s.replace(/^%23/, "").replace(/^#/, "").toUpperCase();
  return s;
}

let cachedBase = "";
async function getBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") return "";
  if (cachedBase) return cachedBase;

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) {
      cachedBase = `${proto}://${host}`;
      return cachedBase;
    }
  } catch {}

  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  cachedBase = envUrl;
  return cachedBase;
}

/** Erreur HTTP structurée pour nos fetchs internes */
export class HttpError extends Error {
  status: number;
  code?: string | number;
  body?: any;
  url: string;
  constructor(msg: string, status: number, code: string | number | undefined, body: any, url: string) {
    super(msg);
    this.status = status;
    this.code = code;
    this.body = body;
    this.url = url;
  }
}
export function isHttpError(e: unknown): e is HttpError {
  return !!e && typeof e === "object" && "status" in e && "message" in e;
}

type NextishInit = RequestInit & { next?: { revalidate?: number } };
type FetchOpts = { allow404?: boolean };

async function doFetch<T = any>(path: string, init?: NextishInit, opts?: FetchOpts): Promise<T> {
  const base = await getBaseUrl();
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (res.status === 404 && opts?.allow404) {
      try {
        await (ct.includes("application/json") ? res.json() : res.text());
      } catch {}
      return null as unknown as T;
    }

    let body: any = null;
    let msg = `HTTP ${res.status}`;
    let code: string | number | undefined;

    try {
      if (ct.includes("application/json")) {
        body = await res.json();
        msg = body?.message || body?.reason || msg;
        code = body?.code || body?.error || body?.reason;
      } else {
        const txt = await res.text();
        msg = txt || msg;
      }
    } catch {
    }

    throw new HttpError(msg, res.status, code, body, url);
  }

  return (ct.includes("application/json") ? res.json() : (await res.text())) as T;
}

export async function getPlayer(tagOrName: string): Promise<Player> {
  const tag = normalizeTag(tagOrName);
  return doFetch<Player>(`/api/players/${tag}`, { cache: "no-store" });
}

export async function getPlayerSafe(tagOrName: string): Promise<Player | null> {
  const tag = normalizeTag(tagOrName);
  return doFetch<Player | null>(`/api/players/${tag}`, { cache: "no-store" }, { allow404: true });
}

export async function getBattleLog(tagOrName: string): Promise<BattleLog> {
  const tag = normalizeTag(tagOrName);
  return doFetch<BattleLog>(`/api/players/${tag}/battlelog`, { cache: "no-store" });
}

export async function getBrawlers(): Promise<{ items: Brawler[] }> {
  return doFetch<{ items: Brawler[] }>(`/api/brawlers`, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
}

export async function getBrawler(id: string) {
  return doFetch<Brawler>(`/api/brawlers/${id}`, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
}

export async function getClub(tagOrName: string) {
  const tag = normalizeTag(tagOrName);
  return doFetch(`/api/clubs/${tag}`, { cache: "no-store" });
}

export async function getRankings(
  country: string,
  kind: "players" | "clubs" | "brawlers",
  brawlerId?: string
) {
  const qs = new URLSearchParams();
  if (brawlerId) qs.set("brawlerId", brawlerId);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return doFetch(`/api/rankings/${country}/${kind}${query}`, { cache: "no-store" });
}

export async function getEvents() {
  return doFetch(`/api/events`, { cache: "no-store" });
}

export async function getCosmetics() {
  try {
    return await doFetch(`/api/cosmetics/skins`, {
      cache: "force-cache",
      next: { revalidate: 86400 },
    });
  } catch {
    return null;
  }
}

export async function getBrawlerAssets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brawlers/brawler-assets`, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error("Failed to load brawler assets");
  return res.json() as Promise<{
    items: Array<{ id: number; name: string; imageUrl?: string | null; imageUrl2?: string | null }>;
  }>;
}
