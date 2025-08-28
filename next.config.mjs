/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better caching
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
  },
  // NOTE: CSP and Permissions-Policy are managed in `middleware.ts`.
  // Removed static headers() here to avoid conflicting/overly-restrictive connect-src blocking WS.
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'framer-motion',
      'react-hook-form',
      '@hookform/resolvers'
    ],
  },
  // API configuration for security
  serverExternalPackages: [],
  // Webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    return config
  },
  // Compiler options for better optimization
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables that should be available at build time
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
    // Supabase configuration from environment variables
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default nextConfig
