// app/api/_utils.ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const API_BASE = "https://api.brawlstars.com/v1";

/**
 * Normalise le tag et le préfixe en %23 (encodage de '#').
 * Ex: "gguqj28q" -> "%23GGUQJ28Q"
 */
export function normTag(tag: string) {
  return `%23${String(tag).replace(/^%23/, "").replace(/^#/, "").toUpperCase()}`;
}

/**
 * Appel upstream avec propagation du status et du content-type.
 */
export async function upstream(path: string) {
  if (!env || !env.BRAWL_API_TOKEN) {
    return NextResponse.json(
      { error: "missing_token", message: "BRAWL_API_TOKEN manquant. Configurez .env.local" },
      { status: 500 }
    );
  }

  try {
    const r = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${env.BRAWL_API_TOKEN}` },
      // Optionnel : Next.js fetch cache control selon ton besoin
      // cache: "no-store",
    });

    const text = await r.text();
    const contentType = r.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: r.status, headers: { "content-type": contentType } });
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_failed", message: String(e) },
      { status: 502 }
    );
  }
}
