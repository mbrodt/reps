import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'extension_icon.svg'],
      manifest: {
        name: 'Reps',
        short_name: 'Reps',
        description: 'Track your workouts and progress',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'extension_icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'extension_icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'extension_icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
