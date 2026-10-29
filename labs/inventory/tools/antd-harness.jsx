// 仅浏览器检查的依赖注入入口；挂载实际 adapter，不复制实现或业务规则。
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import seed from '../data/products.json';
import { createInventoryRepository } from '../src/services/inventory-repository.js';
import App from '../adapters/antd/App.jsx';
import '../adapters/antd/styles.css';

const repository = createInventoryRepository({ storage: null, seed, delay: 180 });
const operation = new URLSearchParams(location.search).get('failure');
if (operation) repository.failNext(operation);
const originalSave = repository.save.bind(repository);
window.__antdSaveCalls = 0;
repository.save = (...args) => { window.__antdSaveCalls++; return originalSave(...args); };
const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
createRoot(document.getElementById('root')).render(
  <StrictMode><QueryClientProvider client={client}><App inventoryRepository={repository} /></QueryClientProvider></StrictMode>,
);
