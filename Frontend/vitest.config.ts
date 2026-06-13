import { defineConfig } from 'vitest/config'
import path from 'path'

// @vitejs/plugin-react y vite-tsconfig-paths son ESM-only y no pueden
// cargarse con require() en este contexto. Se reemplazan por:
//   - esbuild.jsx: 'automatic'  → transform JSX sin el plugin de React
//   - resolve.alias             → resuelve el alias @/ igual que tsconfigPaths
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
})
