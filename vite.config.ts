import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'Nyimbo za Kristo',
        short_name: 'Nyimbo',
        description: 'Dual-language SDA hymnal with offline access',
        theme_color: '#1A237E',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/offline-manifest.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-manifest-cache',
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/instrumentals/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'instrumentals-cache',
            },
          },
        ],
      },
    }),
  ],
})
