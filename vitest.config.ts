import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { loadEnv } from 'vite';

import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
