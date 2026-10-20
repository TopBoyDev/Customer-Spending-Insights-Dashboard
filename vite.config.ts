/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_DEV_PORT = Number(process.env.API_PORT ?? 3001);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${API_DEV_PORT}`,
    },
  },
  build: {
    outDir: 'dist',
    // Maps are generated for debugging but not referenced from the shipped bundles.
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        // Keep large, rarely-changing libraries in their own long-cacheable chunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Vite normalises module ids to forward slashes on every platform.
          if (/\/node_modules\/(recharts|d3-[^/]+|victory-vendor)\//.test(id)) return 'charts';
          if (/\/node_modules\/(@mui|@emotion)\//.test(id)) return 'mui';
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
  test: {
    include: [
      'tests/unit/**/*.test.ts',
      'tests/components/**/*.test.tsx',
      'tests/api/**/*.test.ts',
    ],
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    // Component tests render the full UI against a real HTTP server; allow slower CI machines.
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: ['src/**', 'server/**', 'shared/**'],
      exclude: ['src/main.tsx', 'server/index.ts'],
    },
  },
});
