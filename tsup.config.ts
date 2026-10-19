import { defineConfig } from 'tsup';

// The server is bundled together with its runtime dependencies into a single
// CommonJS file, so the production container needs no node_modules at all.
export default defineConfig({
  entry: { index: 'server/index.ts' },
  outDir: 'dist-server',
  format: ['cjs'],
  platform: 'node',
  target: 'node20',
  noExternal: [/.*/],
  sourcemap: true,
  clean: true,
  minify: false,
});
