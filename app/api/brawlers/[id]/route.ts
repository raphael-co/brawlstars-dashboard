
import { upstream } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 

  return upstream(`/brawlers/${id}`);
}
