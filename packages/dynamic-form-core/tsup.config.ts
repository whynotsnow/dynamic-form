import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/exports.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react']
});
