// app/api/brawler-assets/route.ts
import { NextResponse } from 'next/server'

export const revalidate = 60 * 60 * 24 // 24 h (CDN-friendly)

export async function GET() {
  const r = await fetch('https://api.brawlapi.com/v1/brawlers', {
    // On laisse BrawlAPI en cache côté edge / CDN
    headers: { 'Accept': 'application/json' },
    // Revalidate côté Next (ISR)
    next: { revalidate },
  })
  if (!r.ok) {
    const msg = await r.text().catch(() => '')
    return NextResponse.json({ error: `BrawlAPI error ${r.status}: ${msg}` }, { status: 502 })
  }
  const data = await r.json()
  // Normalise en { items: [...] } et garde (id, name, imageUrl, imageUrl2)
  const items = (data?.list ?? data?.items ?? data ?? []).map((b: any) => ({
    id: Number(b?.id),
    name: String(b?.name ?? ''),
    imageUrl: b?.imageUrl ?? null,   // souvent "icon"
    imageUrl2: b?.imageUrl2 ?? null, // souvent "render" (full body)
  }))
  return NextResponse.json({ items })
}
