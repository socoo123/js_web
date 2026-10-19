// @vitest-environment happy-dom
import { createTestClient } from "./rtl-support.jsx";
import { afterEach, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { products } from "../../../shared/products.js";
import App from "../src/App.jsx";
import CachedProductDetails from "../src/CachedProductDetails.jsx";
import { fetchProduct } from "../src/product-api.js";

afterEach(() => localStorage.clear());
const renderApp = () => render(<MemoryRouter useTransitions={false} initialEntries={["/products"]}><App /></MemoryRouter>);

it("非法价格修正后，列表、统计和重新挂载的库存一致", async () => {
  const user = userEvent.setup();
  const first = renderApp();
  const mouse = () => screen.getByRole("article", { name: "无线鼠标" });
  await user.click(within(mouse()).getByRole("button", { name: "编辑" }));
  const price = screen.getByRole("textbox", { name: "单价（元，必填）" });
  await user.clear(price);
  await user.type(price, "0.001");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(price).toHaveFocus();
  expect(price).toHaveAccessibleDescription(/最多两位小数/);
  expect(mouse()).toHaveTextContent("¥129.00");
  await user.clear(price);
  await user.type(price, "0.29");
  const stock = screen.getByRole("spinbutton", { name: "库存数量（必填）" });
  await user.clear(stock);
  await user.type(stock, "3");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(screen.queryByRole("form", { name: "编辑 P002" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "库存管理" })).toHaveFocus();
  expect(mouse()).toHaveTextContent("库存：3 件");
  expect(mouse()).toHaveTextContent("¥0.29");
  expect(screen.getByText(/全部：6 种/)).toHaveTextContent("总库存 55 件 · 库存总价值 ¥26348.87");
  await user.click(screen.getByRole("button", { name: "保存本地快照" }));
  first.unmount();
  renderApp();
  expect(mouse()).toHaveTextContent("库存：3 件");
  expect(mouse()).toHaveTextContent("¥0.29");
  expect(screen.getByText(/全部：6 种/)).toHaveTextContent("总库存 55 件 · 库存总价值 ¥26348.87");
});

it("HTTP 200 的错误商品被拒绝，重试后展示正确详情", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(products[0])))
    .mockResolvedValueOnce(new Response(JSON.stringify(products[1])));
  vi.stubGlobal("fetch", fetchMock);
  render(<QueryClientProvider client={createTestClient()}>
    <CachedProductDetails productId="P002" loadProduct={fetchProduct} />
  </QueryClientProvider>);
  expect(await screen.findByRole("alert")).toHaveTextContent("商品数据格式不正确");
  expect(screen.queryByRole("region", { name: "缓存商品详情" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "重试详情" }));
  expect(await screen.findByRole("region", { name: "缓存商品详情" })).toHaveTextContent("无线鼠标 · 外设 · 缓存库存 0 件");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
