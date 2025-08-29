/**
 * YouTube URL Detection and Processing Utilities
 */

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  url: string
  thumbnail?: string
}

/**
 * Detects YouTube URLs in text content
 */
export function detectYouTubeUrls(text: string): string[] {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g

  const urls: string[] = []
  let match

  while ((match = youtubeRegex.exec(text)) !== null) {
    const fullUrl = match[0]
    // Ensure it has a proper protocol
    const processedUrl = fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`
    urls.push(processedUrl)
  }

  return [...new Set(urls)] // Remove duplicates
}

/**
 * Extracts video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const validDomains = ['youtube.com', 'youtu.be', 'www.youtube.com']

    if (!validDomains.includes(urlObj.hostname)) {
      return false
    }

    const videoId = extractYouTubeVideoId(url)
    return videoId !== null
  } catch {
    return false
  }
}

/**
 * Gets YouTube video info (basic info without API call)
 */
export function getYouTubeVideoInfo(url: string): YouTubeVideoInfo | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  return {
    videoId,
    title: `YouTube Video (${videoId.substring(0, 8)}...)`,
    url,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}

/**
 * Creates a video-to-app card for a detected YouTube URL
 */
export function createVideoToAppCard(videoUrl: string, sessionId?: string) {
  const videoInfo = getYouTubeVideoInfo(videoUrl)
  if (!videoInfo) return null

  return {
    videoUrl: videoInfo.url,
    status: 'pending' as const,
    sessionId: sessionId || `video_${Date.now()}`,
    progress: 0,
    spec: '',
    code: '',
    error: null,
    videoInfo
  }
}
