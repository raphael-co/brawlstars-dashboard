import { NextResponse } from "next/server";
import { upstream, normTag } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ tag: string }> }
) {
  const { tag } = await context.params; 
  const encTag = normTag(tag);

  if (!encTag) {
    return NextResponse.json({ error: "tag_requis" }, { status: 400 });
  }
  return upstream(`/players/${encTag}`);
}
