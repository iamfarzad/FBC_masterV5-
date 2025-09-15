import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect all traffic to chat route as the single source of truth
  redirect('/chat')
}
