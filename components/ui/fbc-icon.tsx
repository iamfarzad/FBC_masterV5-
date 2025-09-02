"use client"

import { motion } from "framer-motion"
import { cn } from '@/src/core/utils'
import Image from 'next/image'
import { useTheme } from 'next-themes'

interface FbcIconProps {
  className?: string
  variant?: 'default' | 'favicon' | 'app-icon' | 'logo' | 'large-logo'
  size?: number
}

export function FbcIcon({
  className,
  variant = 'default',
  size = 24
}: FbcIconProps) {
  const { theme } = useTheme()

  // Icon paths based on variant and theme
  const getIconPath = () => {
    const isDark = theme === 'dark'
    const basePath = isDark ? 'fbc-voice-orb-dark-png' : 'fbc-voice-orb-light-png'

    switch (variant) {
      case 'favicon':
        return isDark
          ? `/fbc-icon/${basePath}/fbc-voice-orb-dark-32.png`
          : `/fbc-icon/${basePath}/fbc-voice-orb-favicon-32.png`
      case 'app-icon':
        return isDark
          ? `/fbc-icon/${basePath}/fbc-voice-orb-dark-192.png`
          : `/fbc-icon/${basePath}/fbc-voice-orb-appicon-192.png`
      case 'logo':
        return isDark
          ? `/fbc-icon/${basePath}/fbc-voice-orb-dark-512.png`
          : `/fbc-icon/${basePath}/fbc-voice-orb-logo-512.png`
      case 'large-logo':
        return isDark
          ? `/fbc-icon/${basePath}/fbc-voice-orb-dark-1024.png`
          : `/fbc-icon/${basePath}/fbc-voice-orb-logo-1024.png`
      default:
        // For default, use the SVG for better scalability
        return isDark
          ? `/fbc-icon/${basePath}/fbc-voice-orb-logo-dark.svg`
          : `/fbc-icon/fbc-voice-orb-light-png/fbc-voice-orb-logo.svg`
    }
  }

  // Get appropriate size for each variant
  const getIconSize = () => {
    switch (variant) {
      case 'favicon':
        return 32
      case 'app-icon':
        return 192
      case 'logo':
        return 64 // Reasonable size for most logo uses
      case 'large-logo':
        return 256 // For hero sections and large displays
      default:
        return size
    }
  }

  const iconPath = getIconPath()
  const iconSize = getIconSize()

  // Use SVG for default variant, PNG for others
  if (variant === 'default' && iconPath.endsWith('.svg')) {
    return (
      <motion.div
        className={cn("inline-block", className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        style={{ width: size, height: size }}
      >
        <Image
          src={iconPath}
          alt="F.B/c Logo"
          width={size}
          height={size}
          className="size-full object-contain"
          priority
        />
      </motion.div>
    )
  }

  // Use PNG for specific variants with error handling
  return (
    <motion.div
      className={cn("inline-block", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      style={{ width: iconSize, height: iconSize }}
    >
      <Image
        src={iconPath}
        alt="F.B/c Logo"
        width={iconSize}
        height={iconSize}
        className="size-full object-contain"
        priority
        onError={(e) => {
          // Fallback to light version if dark version doesn't exist
          const target = e.target as HTMLImageElement
          if (theme === 'dark' && target.src.includes('dark-png')) {
            // Convert dark mode filenames to light mode equivalents
            let fallbackSrc = target.src.replace('dark-png', 'light-png')

            // Handle the different naming conventions
            if (fallbackSrc.includes('fbc-voice-orb-dark-32.png')) {
              fallbackSrc = fallbackSrc.replace('fbc-voice-orb-dark-32.png', 'fbc-voice-orb-favicon-32.png')
            } else if (fallbackSrc.includes('fbc-voice-orb-dark-192.png')) {
              fallbackSrc = fallbackSrc.replace('fbc-voice-orb-dark-192.png', 'fbc-voice-orb-appicon-192.png')
            } else if (fallbackSrc.includes('fbc-voice-orb-dark-512.png')) {
              fallbackSrc = fallbackSrc.replace('fbc-voice-orb-dark-512.png', 'fbc-voice-orb-logo-512.png')
            } else if (fallbackSrc.includes('fbc-voice-orb-dark-1024.png')) {
              fallbackSrc = fallbackSrc.replace('fbc-voice-orb-dark-1024.png', 'fbc-voice-orb-logo-1024.png')
            } else if (fallbackSrc.includes('fbc-voice-orb-logo-dark.svg')) {
              fallbackSrc = fallbackSrc.replace('fbc-voice-orb-logo-dark.svg', 'fbc-voice-orb-logo.svg')
            }

            target.src = fallbackSrc
          }
        }}
      />
    </motion.div>
  )
}
