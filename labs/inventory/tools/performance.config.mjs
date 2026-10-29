import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  cacheDir: '.lab/cache/performance',
  plugins: [react()],
  test: { environment: 'happy-dom', include: ['tools/performance-check.test.jsx'], restoreMocks: true },
});
