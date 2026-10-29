import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({cacheDir:'.lab/vitest-effect-a3',plugins:[react()],test:{environment:'happy-dom',fsModuleCachePath:'.lab/vitest-effect-a3-modules',include:['tools/effect-a3.test.jsx','tools/contract-a3.test.jsx']}});
