
import { z } from 'zod'

const schema = z.object({
  BRAWL_API_TOKEN: z.string().min(10, 'BRAWL_API_TOKEN manquant ou invalide'),
  USE_BRAWLIFY: z.string().optional()
})

export const env = (() => {
  const parsed = schema.safeParse({
    BRAWL_API_TOKEN: process.env.BRAWL_API_TOKEN,
    USE_BRAWLIFY: process.env.USE_BRAWLIFY,
  })
  if (!parsed.success) {
    // On n'échoue pas au boot du serveur Next; les routes /api retourneront 500 explicite
    return { error: parsed.error.flatten().fieldErrors, BRAWL_API_TOKEN: undefined as any, USE_BRAWLIFY: process.env.USE_BRAWLIFY }
  }
  return parsed.data
})()
