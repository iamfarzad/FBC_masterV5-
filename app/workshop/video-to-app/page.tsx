import { VideoLearningToolClient } from './VideoLearningToolClient'

interface VideoToAppPageProps {
  searchParams: Promise<Record<string, string>>
}

export default function VideoToAppWorkshopPage({
  searchParams,
}: VideoToAppPageProps) {
  // Handle searchParams in client component
  return (
    <VideoLearningToolClient
      searchParams={searchParams}
      mode="workshop"
    />
  )
}
