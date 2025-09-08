import { NextResponse } from 'next/server'

export const revalidate = 86400

export async function GET() {
  const r = await fetch('https://api.brawlapi.com/v1/brawlers', {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, 
  })

  if (!r.ok) {
    const msg = await r.text().catch(() => '')
    return NextResponse.json(
      { error: `BrawlAPI error ${r.status}: ${msg}` },
      { status: 502 }
    )
  }

  const data = await r.json()

  const items = (data?.list ?? data?.items ?? data ?? []).map((b: any) => ({
    id: Number(b?.id),
    name: String(b?.name ?? ''),
    imageUrl: b?.imageUrl ?? null,
    imageUrl2: b?.imageUrl2 ?? null,
  }))

  return NextResponse.json({ items })
}
