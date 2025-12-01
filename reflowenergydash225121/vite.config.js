import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'papaparse']
        }
      }
    }
  },
  server: {
    port: process.env.PORT || 3000,
    host: true,
      allowedHosts: true
  },
  assetsInclude: ['**/*.csv']
})
