import { upstream } from "@/app/api/_utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string; brawlerId: string }> }
) {
  const { country, brawlerId } = await params;

  const c = String(country || "").toLowerCase();
  const b = String(brawlerId || "");

  if (!c || !b) {
    return NextResponse.json(
      { error: "country and brawlerId required" },
      { status: 400 }
    );
  }

  return upstream(
    `/rankings/${encodeURIComponent(c)}/brawlers/${encodeURIComponent(b)}`
  );
}
