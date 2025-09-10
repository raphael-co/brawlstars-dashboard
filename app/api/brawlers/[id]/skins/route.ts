import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const r = await fetch(`https://api.brawlify.com/v1/brawlers/model/${id}`, {
      cache: "force-cache",
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    console.log(r);
    
    if (!r.ok) {
      console.error(`[API /brawlers/${id}/skins] Brawlify request failed: ${r.status} ${r.statusText}`);
      return NextResponse.json({ error: "brawlify_failed" }, { status: 502 });
    }

    const data = await r.json();
    const skins = data ?? [];

    console.log(`[API /brawlers/${id}/skins] Skins fetched:`, skins);
    return NextResponse.json({ items: skins });
  } catch (err) {
    console.error(`[API /brawlers/${id}/skins] Unexpected error:`, err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
