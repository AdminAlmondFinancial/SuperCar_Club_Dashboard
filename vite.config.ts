import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // three.js lives in its own lazily loaded chunk for the 3D viewer.
  build: { chunkSizeWarningLimit: 1300 },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
