import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import seed from '../data/products.json';
import ProductEditor from '../src/react/ProductEditor.jsx';

afterEach(cleanup);
test('Action 收到第二个参数中的 FormData，空白仍拒绝、0 合法', async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue(undefined);
  render(<ProductEditor product={structuredClone(seed[1])} onSave={save} onCancel={() => {}} />);
  const stock = screen.getByLabelText('库存', { exact: true });
  await user.clear(stock);
  await user.click(screen.getByRole('button', { name: '保存', exact: true }));
  expect(await screen.findByRole('alert')).toHaveTextContent('请输入库存，空白无效');
  expect(save).not.toHaveBeenCalled();
  expect(stock).toHaveFocus();
  await user.type(stock, '0');
  await user.click(screen.getByRole('button', { name: '保存', exact: true }));
  expect(await screen.findByText('保存完成')).toBeInTheDocument();
  expect(save).toHaveBeenCalledExactlyOnceWith(seed[1]);
});

test('pending 防重复；失败预览回滚且受控草稿保留；重试保存一次', async () => {
  const user = userEvent.setup();
  let rejectSave;
  const save = vi.fn().mockImplementationOnce(() => new Promise((_, reject) => { rejectSave = reject; }))
    .mockResolvedValueOnce(undefined);
  render(<ProductEditor product={structuredClone(seed[3])} onSave={save} onCancel={() => {}} />);
  expect(screen.getByRole('combobox', { name: '编辑分类', exact: true })).toHaveValue('配件');
  const stock = screen.getByLabelText('库存', { exact: true });
  await user.clear(stock); await user.type(stock, '8');
  await user.click(screen.getByRole('button', { name: '保存', exact: true }));
  expect(screen.getByRole('status')).toHaveTextContent('预览库存 8 件（等待确认）');
  const pendingButton = screen.getByRole('button', { name: '正在保存…' });
  expect(pendingButton).toBeDisabled();
  await user.click(pendingButton);
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => rejectSave(new Error('模拟保存失败')));
  expect(await screen.findByRole('alert')).toHaveTextContent('模拟保存失败');
  expect(screen.getByRole('status')).toHaveTextContent('预览库存 3 件（已保存）');
  expect(stock).toHaveValue('8');
  expect(seed[3].stock).toBe(3);
  await user.click(screen.getByRole('button', { name: '保存', exact: true }));
  expect(await screen.findByText('保存完成')).toBeInTheDocument();
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1][0]).toEqual({ ...seed[3], stock: 8 });
});

test('多个错误按名称、库存、价格、分类聚焦，不依赖校验对象的插入顺序', async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue(undefined);
  render(<ProductEditor product={{ ...structuredClone(seed[3]), category: '未知' }} onSave={save} onCancel={() => {}} />);
  const form = screen.getByRole('form', { name: '商品编辑', exact: true });
  expect(form).toHaveAttribute('novalidate');
  const name = screen.getByLabelText('名称', { exact: true });
  const stock = screen.getByLabelText('库存', { exact: true });
  const price = screen.getByLabelText('价格（元）', { exact: true });
  const category = screen.getByRole('combobox', { name: '编辑分类', exact: true });
  expect(name).toHaveFocus();
  await user.clear(name); await user.clear(stock); await user.clear(price);
  const submit = () => user.click(screen.getByRole('button', { name: '保存', exact: true }));
  await submit(); await waitFor(() => expect(name).toHaveFocus());
  await user.type(name, 'USB-C 扩展坞');
  await submit(); await waitFor(() => expect(stock).toHaveFocus());
  await user.type(stock, '0');
  await submit(); await waitFor(() => expect(price).toHaveFocus());
  await user.type(price, '299.00');
  await submit(); await waitFor(() => expect(category).toHaveFocus());
  expect(category).toHaveAttribute('aria-invalid', 'true');
  expect(category).toHaveAccessibleDescription('分类无效');
  expect(save).not.toHaveBeenCalled();
});

test('取消只调用无参数的 onCancel，不把点击事件当焦点目标', async () => {
  const user = userEvent.setup();
  const cancel = vi.fn();
  render(<ProductEditor product={structuredClone(seed[0])} onSave={() => {}} onCancel={cancel} />);
  await user.click(screen.getByRole('button', { name: '取消', exact: true }));
  expect(cancel).toHaveBeenCalledExactlyOnceWith();
});
