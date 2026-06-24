import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          crawlLinks: true,
          outputPath: 'index.html',
        },
      },
    }),
    react(),
  ],
  build: {
    outDir: 'dist',
  },
})