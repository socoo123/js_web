import {existsSync} from 'node:fs';
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
if(existsSync(new URL('../src/react/query-options.js',import.meta.url)))throw new Error('save-overflow-a3 only covers C29–C31 synchronous App; C32+ use repository/Action tests.');
export default defineConfig({
 cacheDir:'.lab/vitest-save-overflow-a3',plugins:[react()],
 test:{environment:'happy-dom',fsModuleCachePath:'.lab/vitest-save-overflow-a3-modules',include:['tools/save-overflow-a3.test.jsx']},
});
