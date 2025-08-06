import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          toast: ['react-toastify', 'react-hot-toast'],
          emoji: ['emoji-picker-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // optional: increases warning limit from 500 KB to 1000 KB
  }
});