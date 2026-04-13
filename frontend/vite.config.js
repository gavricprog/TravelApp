import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy avoids browser CORS + HTTPS cert issues during local dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5230',
        changeOrigin: true,
      },
    },
  },
});
