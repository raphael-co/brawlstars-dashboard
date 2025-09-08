
import { upstream } from '@/app/api/_utils'

export async function GET() {
  return upstream('/brawlers')
}
