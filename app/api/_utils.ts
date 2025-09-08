import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const API_BASE = "https://api.brawlstars.com/v1";

export function normTag(tag: string) {
  return `%23${String(tag).replace(/^%23/, "").replace(/^#/, "").toUpperCase()}`;
}

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
