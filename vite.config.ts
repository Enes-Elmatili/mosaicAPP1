import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
const enablePwa = (process.env.VITE_ENABLE_PWA || 'false') !== 'false';

const apiTarget = process.env.VITE_API_ORIGIN || 'http://localhost:3000';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    enablePwa &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'robots.txt',
          'icon-192.png',
          'icon-512.png',
          'offline.html',
        ],
        manifest: {
          name: 'MOSAIC - Gestion Immobilière',
          short_name: 'MOSAIC',
          description: 'Plateforme complète de gestion immobilière',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#3b82f6',
          scope: '/',
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /.*\.(?:png|jpg|jpeg|svg|webp)$/,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'images' },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkFirst',
              options: { cacheName: 'api', networkTimeoutSeconds: 4 },
            },
            {
              urlPattern: /.*\.(?:js|css|html)$/,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'static-resources' },
            },
          ],
        },
      }),
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Vitest config moved to vitest.config.ts to avoid ESM issues
});
