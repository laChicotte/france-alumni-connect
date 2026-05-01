import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const securityHeaders = [
  // Empêche l'intégration du site dans une iframe (protection clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Empêche le navigateur de deviner le type MIME d'un fichier
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limite les infos envoyées au referrer lors des navigations externes
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS pendant 1 an (navigateurs modernes uniquement)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Désactive les fonctionnalités sensibles non utilisées
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Active la protection XSS intégrée des anciens navigateurs
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'egxdkfufinhanczdxqqh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
