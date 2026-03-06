import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // All /api/* requests → https://api.sportsrc.org/v2/
      // This bypasses browser CORS restrictions in dev mode.
      '/api': {
        target: 'https://api.sportsrc.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/v2'),
      },
    },
  },
});

