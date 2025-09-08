
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const r = await fetch('https://api.brawlify.com/v1/skins', { next: { revalidate: 86400 } })
    const text = await r.text()
    const contentType = r.headers.get('content-type') || 'application/json'
    return new NextResponse(text, { status: r.status, headers: { 'content-type': contentType } })
  } catch (e: any) {
    return NextResponse.json({ error: 'upstream_failed', message: String(e) }, { status: 502 })
  }
}
