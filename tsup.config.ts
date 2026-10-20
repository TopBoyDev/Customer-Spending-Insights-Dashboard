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
  // The bundle is the production server: `npm start` must not depend on the
  // caller setting NODE_ENV (which is awkward to do portably on Windows).
  env: { NODE_ENV: 'production' },
  sourcemap: true,
  clean: true,
  minify: false,
});
