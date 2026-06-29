import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'packages/dynamic-form/src'),
      '@whynotsnow/dynamic-form': path.resolve(
        __dirname,
        'packages/dynamic-form/src/exports.ts'
      )
    }
  },
  server: {
    port: 3000
  }
});
