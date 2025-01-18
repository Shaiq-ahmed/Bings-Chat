import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "https://bings-chat.onrender.com/", // Your backend API URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      // Only include essential aliases if needed by your app
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
