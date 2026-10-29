import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tools/antd-contract.test.js'] } });
