import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/token': {
        target: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/token/, '')
      }
    }
  },
  base: process.env.VITE_BASE_PATH || "/",
})
