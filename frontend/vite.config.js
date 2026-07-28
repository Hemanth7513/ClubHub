import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ClubHub Vijayawada',
        short_name: 'ClubHub',
        description: 'Your premier event and community portal in Vijayawada.',
        theme_color: '#fcfcfc',
        background_color: '#fcfcfc',
        display: 'standalone',
        icons: [
          {
            src: 'https://via.placeholder.com/192x192/ff2e63/ffffff?text=CH',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512x512/ff2e63/ffffff?text=CH',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    sourcemap: false, // Prevent DevTools from showing original source code
  },
  esbuild: {
    drop: ['console', 'debugger'], // Prevent leaking sensitive info in console
  }
})
