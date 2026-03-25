import withBundleAnalyzer from '@next/bundle-analyzer'

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  webpack: (config) => {
    // Required for @react-pdf/renderer in Next.js
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
}

export default analyzer(nextConfig)
