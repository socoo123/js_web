import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  cacheDir: '.lab/cache/delivery', plugins: [react()],
  test: { environment: 'happy-dom', include: ['tests/react/**/*.test.jsx'], restoreMocks: true },
});
