import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://cleanuri.com/api/v1/shorten',
        changeOrigin: true,
        rewrite: () => ''
      }
    }
  }
})