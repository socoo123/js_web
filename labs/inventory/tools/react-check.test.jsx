import React from 'react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import products from '../data/products.json' with { type: 'json' };
import StockActions from '../src/react/StockActions.jsx';

afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('当前工作文件中的 P001 状态更新', () => {
  test('课内混合队列按顺序得到 2，本次事件仍读到 12', () => {
    let observed;
    function QueueProbe() {
      const [stock, setStock] = React.useState(12);
      return <button onClick={() => {
        setStock(stock + 1);
        setStock((previous) => previous + 3);
        setStock(0);
        setStock((previous) => previous + 2);
        observed = stock;
      }}>{stock}</button>;
    }
    render(<QueueProbe />); fireEvent.click(screen.getByRole('button', { name: '12', exact: true }));
    expect(screen.getByRole('button', { name: '2', exact: true })).toBeTruthy(); expect(observed).toBe(12);
  });
  test('一次事件连续补货三次：12→15', () => {
    render(<StockActions product={structuredClone(products[0])} />);
    fireEvent.click(screen.getByRole('button', { name: '连续补三件' }));
    expect(screen.getByRole('status').textContent).toContain('15 件');
  });
  test('延迟 +3 期间立即 +1：12→13→16', async () => {
    vi.useFakeTimers();
    render(<StockActions product={structuredClone(products[0])} />);
    fireEvent.click(screen.getByRole('button', { name: '延迟补三件' }));
    fireEvent.click(screen.getByRole('button', { name: '立即补一件' }));
    expect(screen.getByRole('status').textContent).toContain('13 件');
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByRole('status').textContent).toContain('16 件');
    expect(products[0].stock).toBe(12);
  });
});
