import React, { lazy, Suspense } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import seed from '../data/products.json';
import ReportPanel from '../src/react/ReportPanel.jsx';
import ReportErrorBoundary from '../src/react/ReportErrorBoundary.jsx';

afterEach(cleanup);
test('分类统计跟随最新 products，补货后不能保留旧值', () => {
  const { rerender } = render(<ReportPanel products={structuredClone(seed)} />);
  expect(screen.getByRole('row', { name: '外设 2 12 478800' })).toBeInTheDocument();
  const next = seed.map((product) => product.id === 'P002' ? { ...product, stock: 1 } : product);
  rerender(<ReportPanel products={next} />);
  const row = screen.getByRole('row', { name: '外设 2 13 491700' });
  expect(within(row).getByRole('cell', { name: '491700' })).toBeInTheDocument();
});
test('lazy 等代码；局部渲染失败不卸载库存表单', async () => {
  let complete;
  const LazyReport = lazy(() => new Promise((resolve) => { complete = resolve; }));
  const { rerender } = render(<><label>保留草稿 <input defaultValue="未保存" /></label>
    <ReportErrorBoundary><Suspense fallback={<p role="status">正在加载报表代码…</p>}>
      <LazyReport products={seed} />
    </Suspense></ReportErrorBoundary></>);
  expect(screen.getByRole('status')).toHaveTextContent('正在加载报表代码');
  await act(async () => complete({ default: ReportPanel }));
  expect(await screen.findByRole('region', { name: '分类报表' })).toBeInTheDocument();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  rerender(<><label>保留草稿 <input defaultValue="未保存" /></label>
    <ReportErrorBoundary><ReportPanel products={seed} fail /></ReportErrorBoundary></>);
  expect(screen.getByRole('alert')).toHaveTextContent('报表暂时无法显示');
  expect(screen.getByLabelText('保留草稿')).toHaveValue('未保存');
});
