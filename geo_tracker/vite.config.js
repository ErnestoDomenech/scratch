import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Geo Tracker',
        short_name: 'Geo Tracker',
        description: 'Track your tasks and location in real-time',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn.iconscout.com/icon/free/png-512/free-location-2064972-1748283.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn.iconscout.com/icon/free/png-512/free-location-2064972-1748283.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
