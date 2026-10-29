import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  cacheDir: '.lab/cache/action',
  plugins: [react()],
  test: { environment: 'happy-dom', include: ['tools/action-check.test.jsx'], restoreMocks: true },
});
