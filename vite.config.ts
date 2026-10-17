import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/drug-game/',
  plugins: [react()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'react-vendor': ['react', 'react-dom'],
          'lucide-icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
