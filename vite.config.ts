import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Replace with your backend port
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8080', // Replace with your backend port
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:8080', // Replace with your backend port
        changeOrigin: true,
      },
    },
  },
});
