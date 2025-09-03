'use client'

import { VideoLearningToolClient } from './VideoLearningToolClient'

interface VideoToAppPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function VideoToAppWorkshopPage({
  searchParams,
}: VideoToAppPageProps) {
  // Await searchParams before using its properties
  const params = await searchParams

  // Get initial data from URL params
  const initialVideoUrl = params.url || ''
  const sessionId = params.sessionId || ''
  const fromChat = params.from === 'chat'

  return (
    <VideoLearningToolClient
      initialVideoUrl={initialVideoUrl}
      sessionId={sessionId}
      fromChat={fromChat}
      mode="workshop"
    />
  )
}
