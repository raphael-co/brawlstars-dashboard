import { NextResponse } from "next/server";
import { upstream } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ country: string; kind: string }> }
) {
  const { country, kind } = await params;

  if (!country || !kind) {
    return NextResponse.json(
      { error: "country and kind required" },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const brawlerId = url.searchParams.get("brawlerId");
  const suffix =
    kind === "brawlers" && brawlerId
      ? `/brawlers/${encodeURIComponent(brawlerId)}`
      : "";

  // Ex: /rankings/fr/brawlers/16000000  OR  /rankings/fr/players
  return upstream(
    `/rankings/${encodeURIComponent(country)}/${encodeURIComponent(kind)}${suffix}`
  );
}
