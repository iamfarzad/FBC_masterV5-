/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure for Replit webview preview
  allowedDevOrigins: [
    'fe03e229-c7a2-4066-94a9-4acc8747acc3-00-5uzs90s71zib.worf.replit.dev',
    '*.replit.dev',
    '*.repl.co',
    '127.0.0.1',
    'localhost'
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ]
  },
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    return config
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig