import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {existsSync} from 'node:fs';
const query = existsSync(new URL('../src/react/query-options.js',import.meta.url));
const snapshot = existsSync(new URL('../src/react/useProductRequest.js',import.meta.url));
export default defineConfig({
 cacheDir:'.lab/vitest-request-a3',
 plugins:[react()],
 test:{
  environment:'happy-dom',
  fsModuleCachePath:'.lab/vitest-request-a3-modules',
  include:query?['tools/query-a3.test.jsx','tools/contract-a3.test.jsx']:['tools/request-check.test.jsx','tools/contract-a3.test.jsx',...(snapshot?['tools/snapshot-a3.test.jsx']:[])],
 },
});
