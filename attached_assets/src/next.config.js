/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable modern features
    optimizePackageImports: ['lucide-react', 'motion'],
    // PNPM optimizations
    esmExternals: true,
    serverComponentsExternalPackages: [],
  },
  
  // Image configuration for external sources
  images: {
    domains: ['images.unsplash.com', 'unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      }
    ]
  },

  // Webpack configuration for AI Elements
  webpack: (config, { isServer }) => {
    // Handle motion/react imports properly
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': 'motion/react'
    };

    return config;
  }
};

module.exports = nextConfig;