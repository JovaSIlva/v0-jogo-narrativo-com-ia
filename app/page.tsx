import NarrativeGame from '@/components/narrative-game'
import { getSession } from '@/lib/session'

export default async function Home() {
  const user = await getSession()
  return <NarrativeGame user={user} />
}
