import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// vitest/config re-exports vite's defineConfig with the `test` field typed.
import { defineConfig } from 'vitest/config'

// Single source of truth for the GitHub Pages subpath. Change this ONE line once the
// real repo is created — BrowserRouter's basename and every Vite-processed asset URL
// derive from it automatically via import.meta.env.BASE_URL. Use '/' only if the repo
// is ever named '<username>.github.io' (served at the domain root instead of a subpath).
// public/404.html's `pathSegmentsToKeep` tracks this same value (segment count).
const GH_PAGES_BASE = '/portfolio-frontend/'

export default defineConfig({
  base: GH_PAGES_BASE,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
