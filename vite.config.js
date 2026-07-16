import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'static',
  publicDir: '../static/public',
  build: {
    outDir: '../staticfiles',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'static/src/main.js'),
        admin: path.resolve(__dirname, 'static/src/admin.js'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/static': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});