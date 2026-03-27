import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/account': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
