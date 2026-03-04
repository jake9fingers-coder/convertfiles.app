import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // No COOP/COEP headers — single-thread FFmpeg doesn't need SharedArrayBuffer,
  // and these headers break blob URL downloads in Chrome.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@imagemagick/magick-wasm'],
  },
})
