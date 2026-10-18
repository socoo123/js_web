// @vitest-environment happy-dom
import "../tests/rtl-support.jsx";
import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { products } from "../../../shared/products.js";
import { createTestClient } from "../tests/rtl-support.jsx";
import ReviewSummaryCase from "./ReviewSummaryCase.jsx";
import ReviewSummaryBroken from "./ReviewSummaryBroken.jsx";
import ReviewQueryCase from "./ReviewQueryCase.jsx";
import ReviewQueryBroken from "./ReviewQueryBroken.jsx";
import ReviewStorageBroken from "./ReviewStorageBroken.jsx";

it("补货后卡片和统计都应该更新", async () => {
  const user = userEvent.setup();
  render(<ReviewSummaryCase Summary={ReviewSummaryBroken} />);
  await user.click(screen.getByRole("button", { name: "给鼠标补 1 件" }));
  expect(screen.getByText("鼠标库存 1 件")).toBeInTheDocument();
  expect(screen.getByText("统计库存 53 件")).toBeInTheDocument();
});
it("切换鼠标后应该请求并显示 P002", async () => {
  const user = userEvent.setup();
  const client = createTestClient();
  client.setDefaultOptions({ queries: { staleTime: 30_000, retry: false, gcTime: Infinity } });
  const load = vi.fn(async (id) => products.find((product) => product.id === id));
  render(<QueryClientProvider client={client}><ReviewQueryCase Details={ReviewQueryBroken} loadProduct={load} /></QueryClientProvider>);
  await screen.findByText(/详情 P001/);
  await user.click(screen.getByRole("button", { name: "选择鼠标" }));
  expect(screen.getByText("当前编号 P002")).toBeInTheDocument();
  expect(load).toHaveBeenCalledWith("P002", expect.any(Object));
  await screen.findByText(/详情 P002/);
});
it("损坏副本应该回退到初始库存并保留原文", () => {
  const storage = { getItem: () => "{" };
  render(<ReviewStorageBroken storage={storage} storageKey="review" />);
  expect(screen.getByText("本地库存 52 件")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("原记录保留");
  expect(storage.getItem("review")).toBe("{");
});
