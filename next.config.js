/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'cnbl-cdn.bamgrid.com',
      },
      {
        protocol: 'https',
        hostname: 'press.hulu.com',
      },
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
