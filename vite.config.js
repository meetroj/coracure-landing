import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // dev only: the live API answers browsers from its allowed origins only, so `vite dev` reaches it through this proxy
  server: { proxy: { '/api': { target: 'https://api.coracure.in', changeOrigin: true, secure: true } } },
})
