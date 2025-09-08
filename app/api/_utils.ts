import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";          
export const dynamic = "force-dynamic"; 

const API_BASE = "https://bsproxy.royaleapi.dev/v1";

export function normTag(tag: string) {
  return `%23${String(tag).replace(/^%23/, "").replace(/^#/, "").toUpperCase()}`;
}

export async function upstream(path: string) {
  try {
    const { BRAWL_API_TOKEN } = getEnv();

    console.log(BRAWL_API_TOKEN);
    
    if (!BRAWL_API_TOKEN) {
      return NextResponse.json(
        { error: "missing_brawl_api_token" },
        { status: 500 }
      );
    }

    const r = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${BRAWL_API_TOKEN}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await r.text();
    const headers: Record<string, string> = {
      "content-type": r.headers.get("content-type") || "application/json",
    };
    for (const h of [
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset",
      "retry-after",
    ]) {
      const v = r.headers.get(h);
      if (v) headers[h] = v;
    }
    return new NextResponse(text, { status: r.status, headers });
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_failed", message: String(e?.message || e) },
      { status: 502 }
    );
  }
}
