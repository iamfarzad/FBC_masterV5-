import NextImage from 'next/image'
import { Buffer } from 'buffer'

import { cn } from '@/lib/utils'
import type { Experimental_GeneratedImage } from 'ai'

type BaseImageProps = {
  className?: string
  alt?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  unoptimized?: boolean
}

type ExternalImageProps = {
  src: string
} & BaseImageProps

type GeneratedImageProps = Experimental_GeneratedImage & BaseImageProps

export type ImageProps = ExternalImageProps | GeneratedImageProps

const DEFAULT_WIDTH = 1024
const DEFAULT_HEIGHT = 768

const toBase64 = (uint8: Uint8Array): string => {
  if (typeof window === 'undefined') {
    // Node/SSR fallback
    return Buffer.from(uint8).toString('base64')
  }

  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  return btoa(binary)
}

const getClassName = (className?: string) =>
  cn('h-auto w-full max-w-full rounded-md border border-border/20', className)

export const Image = (props: ImageProps) => {
  const width = props.width ?? DEFAULT_WIDTH
  const height = props.height ?? DEFAULT_HEIGHT
  const alt = props.alt ?? 'Image'
  const sizes = props.sizes ?? '100vw'

  if ('src' in props) {
    const { src, priority, unoptimized, className } = props
    return (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={getClassName(className)}
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
      />
    )
  }

  const { base64, uint8Array, mediaType, priority, className, unoptimized } = props
  const dataSrc = base64
    ? `data:${mediaType};base64,${base64}`
    : uint8Array
      ? `data:${mediaType};base64,${toBase64(uint8Array)}`
      : undefined

  if (!dataSrc) {
    return null
  }

  return (
    <NextImage
      src={dataSrc}
      alt={alt}
      width={width}
      height={height}
      className={getClassName(className)}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized ?? true}
    />
  )
}
