import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The base path is set to '/' by default and overridden by the GH Pages
// deploy script when needed. Don't edit this manually — let the deploy
// scripts manage it.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Produces a single bundle that Domo Custom Apps load cleanly.
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
