import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // Keep the heavy WebGL stack + animation lib in separately cached chunks so
        // the initial paint never waits on them.
        manualChunks(id: string) {
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/three-stdlib') ||
            id.includes('node_modules/@react-three') ||
            id.includes('node_modules/zustand')
          ) {
            return 'three'
          }
          if (id.includes('node_modules/gsap')) return 'gsap'
          return undefined
        },
      },
    },
  },
})