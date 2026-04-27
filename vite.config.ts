import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
<<<<<<< Updated upstream
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8000',
=======
      "/auth": {
        target: "http://localhost:8000", // <-- change this
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8000", // <-- change this
>>>>>>> Stashed changes
        changeOrigin: true,
        secure: false,
      },
    },
  },
});