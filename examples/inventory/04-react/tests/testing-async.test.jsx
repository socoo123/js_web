// @vitest-environment happy-dom
import { createTestClient } from "./rtl-support.jsx";
import { it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { products } from "../../../shared/products.js";
import CachedProductDetails from "../src/CachedProductDetails.jsx";
import ProductDetails from "../src/ProductDetails.jsx";

it("详情失败后由用户重试成功", async () => {
  const user = userEvent.setup();
  const load = vi.fn().mockRejectedValueOnce(new Error("模拟断网"))
    .mockResolvedValueOnce(structuredClone(products[1]));
  const client = createTestClient();
  render(<QueryClientProvider client={client}>
    <CachedProductDetails productId="P002" loadProduct={load} />
  </QueryClientProvider>);
  expect(await screen.findByRole("alert")).toHaveTextContent("模拟断网");
  await user.click(screen.getByRole("button", { name: "重试详情" }));
  expect(await screen.findByText(/无线鼠标 · 外设 · 缓存库存 0 件/)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(2);
  expect(load).toHaveBeenLastCalledWith("P002", { signal: expect.any(AbortSignal) });
});

it("等待真实结果时保留加载反馈", async () => {
  let resolve;
  const load = vi.fn(() => new Promise((done) => { resolve = done; }));
  const client = createTestClient();
  render(<QueryClientProvider client={client}>
    <CachedProductDetails productId="P002" loadProduct={load} />
  </QueryClientProvider>);
  expect(screen.getByRole("status")).toHaveTextContent("正在加载 P002");
  expect(screen.queryByRole("region", { name: "缓存商品详情" })).not.toBeInTheDocument();
  await act(async () => resolve(structuredClone(products[1])));
  expect(await screen.findByRole("region", { name: "缓存商品详情" })).toHaveTextContent("缓存库存 0 件");
});

it("离开手工请求组件会取消它的请求", () => {
  let signal;
  const load = vi.fn((id, options) => {
    signal = options.signal;
    return new Promise(() => {});
  });
  const { unmount } = render(<ProductDetails productId="P002" loadProduct={load} />);
  expect(signal.aborted).toBe(false);
  unmount();
  expect(signal.aborted).toBe(true);
});
