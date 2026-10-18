// @vitest-environment happy-dom
import "./rtl-support.jsx";
import { afterEach, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { products } from "../../../shared/products.js";
import { createTestClient } from "./rtl-support.jsx";
import App from "../src/App.jsx";
import ReviewSummaryCase from "../labs/ReviewSummaryCase.jsx";
import ReviewSummaryFixed from "../labs/ReviewSummaryFixed.jsx";
import ReviewQueryCase from "../labs/ReviewQueryCase.jsx";
import ReviewQueryFixed from "../labs/ReviewQueryFixed.jsx";
import ReviewStorageFixed from "../labs/ReviewStorageFixed.jsx";
import { INVENTORY_STORAGE_KEY, initializeInventory, parseInventorySnapshot } from "../src/inventory-storage.js";

afterEach(() => localStorage.clear());
const renderApp = (props = {}) => render(<MemoryRouter initialEntries={["/products"]}><App {...props} /></MemoryRouter>);
const mouse = () => screen.getByRole("article", { name: "无线鼠标" });

it("补货后从同一商品来源重算统计", async () => {
  const user = userEvent.setup();
  render(<ReviewSummaryCase Summary={ReviewSummaryFixed} />);
  await user.click(screen.getByRole("button", { name: "给鼠标补 1 件" }));
  expect(screen.getByText("鼠标库存 1 件")).toBeInTheDocument();
  expect(screen.getByText("统计库存 53 件")).toBeInTheDocument();
});
it("新鲜缓存也按商品编号隔离", async () => {
  const user = userEvent.setup();
  const client = createTestClient();
  client.setDefaultOptions({ queries: { staleTime: 30_000, retry: false, gcTime: Infinity } });
  const load = vi.fn(async (id) => products.find((product) => product.id === id));
  render(<QueryClientProvider client={client}><ReviewQueryCase Details={ReviewQueryFixed} loadProduct={load} /></QueryClientProvider>);
  await screen.findByText(/详情 P001/);
  await user.click(screen.getByRole("button", { name: "选择鼠标" }));
  await screen.findByText(/详情 P002/);
  expect(load).toHaveBeenCalledWith("P002", expect.any(Object));
});
it("损坏副本回退并保留原文", () => {
  const storage = { getItem: () => "{" };
  render(<ReviewStorageFixed storage={storage} storageKey="review" />);
  expect(screen.getByText("本地库存 52 件")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("原记录保留");
  expect(storage.getItem("review")).toBe("{");
});
it("保存后重挂载恢复商品，保存后的未存改动不覆盖快照", async () => {
  const user = userEvent.setup();
  const first = renderApp();
  await user.click(within(mouse()).getByRole("button", { name: "补 1 件" }));
  await user.click(screen.getByRole("button", { name: "保存本地快照" }));
  await user.click(within(mouse()).getByRole("button", { name: "补 1 件" }));
  expect(mouse()).toHaveTextContent("库存：2 件");
  first.unmount();
  renderApp();
  expect(mouse()).toHaveTextContent("库存：1 件");
  expect(screen.getByText(/全部：6 种/)).toHaveTextContent("总库存 53 件 · 库存总价值 ¥26477.00");
});
it("挂载与损坏回退不写盘，清除后当前商品保留、下次挂载恢复初始", async () => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, "{");
  const user = userEvent.setup();
  const first = renderApp();
  expect(localStorage.getItem(INVENTORY_STORAGE_KEY)).toBe("{");
  expect(screen.getByRole("region", { name: "本地库存快照" })).toHaveTextContent("原记录保留");
  await user.click(within(mouse()).getByRole("button", { name: "补 1 件" }));
  await user.click(screen.getByRole("button", { name: "清除本地快照" }));
  expect(localStorage.getItem(INVENTORY_STORAGE_KEY)).toBeNull();
  expect(mouse()).toHaveTextContent("库存：1 件");
  first.unmount();
  renderApp();
  expect(mouse()).toHaveTextContent("库存：0 件");
});
it("保存和清除被拒绝时显示失败，库存仍可编辑", async () => {
  vi.stubGlobal("localStorage", { getItem: () => null,
    setItem: () => { throw new Error("QuotaExceededError"); },
    removeItem: () => { throw new Error("SecurityError"); }, clear() {} });
  const user = userEvent.setup();
  renderApp();
  const region = screen.getByRole("region", { name: "本地库存快照" });
  await user.click(screen.getByRole("button", { name: "保存本地快照" }));
  expect(region).toHaveTextContent("保存失败");
  await user.click(screen.getByRole("button", { name: "清除本地快照" }));
  expect(region).toHaveTextContent("清除失败");
  await user.click(within(mouse()).getByRole("button", { name: "补 1 件" }));
  expect(mouse()).toHaveTextContent("库存：1 件");
});
it("读取被拒绝时回退且不尝试写入", () => {
  const read = vi.fn(() => { throw new Error("SecurityError"); });
  expect(initializeInventory(read).products).toEqual(products);
  expect(read).toHaveBeenCalledOnce();
});
it("本地新增商品能打开详情，且没有静态 JSON 请求", async () => {
  const user = userEvent.setup();
  const load = vi.fn();
  renderApp({ loadProduct: load });
  await user.click(screen.getByRole("button", { name: "新增示例商品" }));
  const card = screen.getByRole("article", { name: "新商品" });
  await user.click(within(card).getByRole("link"));
  expect(screen.getByRole("region", { name: "本地商品详情" })).toHaveTextContent("本地库存 0 件");
  expect(screen.getByRole("heading", { name: "商品详情 P007" })).toBeInTheDocument();
  expect(load).not.toHaveBeenCalled();
});
it("本地补货后详情读取同一 Provider，mock 数据另有来源", async () => {
  const user = userEvent.setup();
  renderApp({ loadProduct: async () => products[1] });
  await user.click(within(mouse()).getByRole("button", { name: "补 1 件" }));
  await user.click(within(mouse()).getByRole("link"));
  expect(screen.getByRole("region", { name: "本地商品详情" })).toHaveTextContent("本地库存 1 件");
  expect(await screen.findByRole("region", { name: "缓存商品详情" })).toHaveTextContent("缓存库存 0 件");
});
it.each([
  "{", "null", '{"version":2,"products":[]}', '{"version":1,"products":{}}',
  JSON.stringify({ version: 1, products: [{ ...products[0], stock: "12" }] }),
  JSON.stringify({ version: 1, products: [products[0], products[0]] }),
  JSON.stringify({ version: 1, products: [{ ...products[0], priceCents: -1 }] }),
  JSON.stringify({ version: 1, products: [{ ...products[0], name: " " }] }),
  JSON.stringify({ version: 1, products: [{ ...products[0], tags: [null] }] }),
])("非法副本拒绝进入业务状态：%s", (raw) => {
  expect(() => parseInventorySnapshot(raw)).toThrow();
});
it("空库存集合和合法的 0 能恢复，解析结果与输入隔离", () => {
  expect(parseInventorySnapshot('{"version":1,"products":[]}')).toEqual([]);
  const parsed = parseInventorySnapshot(JSON.stringify({ version: 1, products }));
  expect(parsed[1].stock).toBe(0);
  parsed[0].tags.push("测试");
  expect(products[0].tags).toEqual(["热销"]);
});
