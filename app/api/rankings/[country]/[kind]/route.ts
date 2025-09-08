import { NextResponse } from "next/server";
import { upstream } from "@/app/api/_utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KINDS = new Set(["players", "clubs", "brawlers"]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ country: string; kind: string }> }
) {
  const { country, kind } = await params;

  const c = String(country || "").toLowerCase();
  const k = String(kind || "").toLowerCase();

  if (!c || !k || !ALLOWED_KINDS.has(k)) {
    return NextResponse.json(
      { error: "invalid country or kind" },
      { status: 400 }
    );
  }

  if (k === "brawlers") {
    const url = new URL(req.url);
    const brawlerId = url.searchParams.get("brawlerId");
    if (!brawlerId) {
      return NextResponse.json(
        { error: "brawlerId required for kind=brawlers" },
        { status: 400 }
      );
    }
    return upstream(
      `/rankings/${encodeURIComponent(c)}/brawlers/${encodeURIComponent(
        brawlerId
      )}`
    );
  }

  return upstream(
    `/rankings/${encodeURIComponent(c)}/${encodeURIComponent(k)}`
  );
}
