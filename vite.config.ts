import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

const PROSEMIRROR_PACKAGES = [
  'prosemirror-model',
  'prosemirror-state',
  'prosemirror-view',
  'prosemirror-transform',
];

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'loro-crdt': path.resolve(__dirname, 'node_modules/loro-crdt'),
      'prosemirror-model': path.resolve(
        __dirname,
        'node_modules/prosemirror-model',
      ),
      'prosemirror-state': path.resolve(
        __dirname,
        'node_modules/prosemirror-state',
      ),
      'prosemirror-view': path.resolve(
        __dirname,
        'node_modules/prosemirror-view',
      ),
      'prosemirror-transform': path.resolve(
        __dirname,
        'node_modules/prosemirror-transform',
      ),
    },
    dedupe: PROSEMIRROR_PACKAGES,
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    viteStaticCopy({
      targets: [
        {
          src: 'appconfig.js',
          dest: '',
        },
      ],
    }),
  ],
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
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: PROSEMIRROR_PACKAGES,
  },
});
