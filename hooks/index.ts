// Media Hooks
export { default as useMediaCapture } from './useMediaCapture';
export { default as useMediaPlayer } from './useMediaPlayer';
export { default as useMediaUploader } from './useMediaUploader';

// Re-export types from MediaService for convenience
export type {
  MediaType,
  MediaStreamConstraints,
  MediaItem,
  MediaSource,
  MediaMetadata,
  MediaCaptureOptions,
  MediaPlaybackOptions,
} from '@/src/core/media/MediaService';

// Re-export uploader types
export type {
  UploadOptions,
  UploadResult,
} from './useMediaUploader';

export { useToast } from './use-toast'
export { useTokenTracking } from './use-token-tracking'
export { useFeatureFlags } from './use-feature-flags'

// Unified patterns
export { useUnifiedMedia } from './useUnifiedMedia'
export { useUnifiedIntelligence } from './useUnifiedIntelligence'
export * as useCommonPatterns from './useCommonPatterns'