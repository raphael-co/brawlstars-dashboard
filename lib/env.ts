import { z } from "zod";

const Schema = z.object({
  BRAWL_API_TOKEN: z.string().min(10, "BRAWL_API_TOKEN manquant ou invalide"),
  USE_BRAWLIFY: z.string().optional(),
});

export function getEnv() {

  const token = (process.env.BRAWL_API_TOKEN ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

  const parsed = Schema.safeParse({
    BRAWL_API_TOKEN: token,
    USE_BRAWLIFY: process.env.USE_BRAWLIFY,
  });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }
  return parsed.data;
}
