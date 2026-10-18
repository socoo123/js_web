// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import { act, lazy, Suspense } from "react";
import { products } from "../../../shared/products.js";
import { summarizeCategories } from "../src/report-summary.js";
import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventoryReport from "../src/InventoryReport.jsx";
import InventoryCounter from "../src/InventoryCounter.jsx";
import ReportPanel from "../src/ReportPanel.jsx";
import ProductDetails from "../src/ProductDetails.jsx";
import StaleMemoFixed from "../labs/StaleMemoFixed.jsx";
import PerfFixed from "../labs/PerfFixed.jsx";
import TransitionFilter from "../labs/TransitionFilter.jsx";
import { TestApp } from "./router-harness.jsx";
import { mount, click, fill } from "./state-harness.jsx";

it("分类报表保持固定业务总值，不修改输入；空库存没有分类", () => {
  const source = structuredClone(products);
  const groups = summarizeCategories(source);
  expect(groups.map(({ category, count, stock }) => [category, count, stock])).toEqual([
    ["外设", 2, 12], ["显示器", 1, 7], ["配件", 2, 28], ["音频", 1, 5],
  ]);
  expect(groups.reduce((sum, group) => sum + group.valueCents, 0)).toBe(2634800);
  expect(source).toEqual(products);
  expect(summarizeCategories([])).toEqual([]);
});

it("只有展开时才请求 lazy 模块，等待 fallback 和成功表格分别显示", async () => {
  let resolveModule;
  const load = vi.fn(() => new Promise((resolve) => { resolveModule = resolve; }));
  const Report = lazy(load);
  const host = await mount(<InventoryProvider><ReportPanel Report={Report} /></InventoryProvider>);
  expect(load).not.toHaveBeenCalled();
  await click("查看分类报表");
  expect(load).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain("正在加载报表代码…");
  await act(async () => resolveModule({ default: InventoryReport }));
  expect(host.querySelector("table").textContent).toContain("按分类汇总（本地库存）");
  await click("收起分类报表"); await click("查看分类报表");
  expect(load).toHaveBeenCalledTimes(1);
});

it("报表渲染失败只替换报表，修正输入后重试保留兄弟区域计数", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  let broken = true;
  function Report(props) {
    if (broken) throw new Error("模拟无效报表输入");
    return <InventoryReport {...props} />;
  }
  const host = await mount(<InventoryProvider><InventoryCounter /><ReportPanel Report={Report} /></InventoryProvider>);
  await click("查看分类报表");
  expect(host.querySelector('[role="alert"]').textContent).toContain("报表暂时无法显示");
  await click("记录 1 次");
  broken = false;
  await click("重试报表渲染");
  expect(host.querySelector("table")).not.toBeNull();
  expect(host.textContent).toContain("已记录 1 次盘点操作");
  expect(log).toHaveBeenCalled();
});

it("lazy 拒绝交给错误边界，重建边界不会重新调用同一 loader", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  let rejectModule;
  const load = vi.fn(() => new Promise((_, reject) => { rejectModule = reject; }));
  const Report = lazy(load);
  const host = await mount(<InventoryProvider><ReportPanel Report={Report} /></InventoryProvider>);
  await click("查看分类报表");
  await act(async () => rejectModule(new Error("模块下载失败")));
  expect(host.textContent).toContain("报表暂时无法显示");
  expect(host.textContent).not.toContain("正在加载报表代码…");
  await click("重试报表渲染");
  expect(load).toHaveBeenCalledTimes(1);
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});

it("Effect 请求的普通加载与失败状态不触发 Suspense fallback", async () => {
  let rejectRequest;
  const load = () => new Promise((_, reject) => { rejectRequest = reject; });
  const host = await mount(<Suspense fallback={<p>Suspense 正在等待…</p>}>
    <ProductDetails productId="P001" loadProduct={load} /></Suspense>);
  expect(host.textContent).toContain("正在加载 P001…");
  expect(host.textContent).not.toContain("Suspense 正在等待…");
  await act(async () => rejectRequest(new Error("HTTP 503")));
  expect(host.querySelector('[role="alert"]').textContent).toContain("HTTP 503");
});

it("计算依赖跟随库存更新，补货后价值同步", async () => {
  const host = await mount(<StaleMemoFixed />);
  await click("补 1 件");
  expect(host.textContent).toContain("库存 13 件 · 价值 5187.00 元");
  await click("补 1 件");
  expect(host.textContent).toContain("库存 14 件 · 价值 5586.00 元");
});

it("缓存优化后的列表保持筛选、选择和备注行为", async () => {
  const host = await mount(<PerfFixed />);
  await fill(host.querySelectorAll("input")[0], "鼠标");
  expect(host.querySelectorAll("li")).toHaveLength(200);
  await fill(host.querySelectorAll("input")[1], "盘点完成");
  await act(async () => host.querySelector("li button").click());
  expect(host.querySelector('[role="status"]').textContent).toContain("已选 P002");
  expect(host.querySelectorAll("input")[1].value).toBe("盘点完成");
});

it("Transition 最终使用最新输入筛选，清空后恢复所有展示行", async () => {
  const host = await mount(<TransitionFilter />);
  await fill(host.querySelector("input"), "鼠标");
  await fill(host.querySelector("input"), "耳机");
  expect(host.querySelectorAll("li")).toHaveLength(200);
  expect(host.querySelector("li").textContent).toContain("降噪耳机");
  expect(host.querySelector('[aria-busy]').getAttribute("aria-busy")).toBe("false");
  await fill(host.querySelector("input"), "");
  expect(host.querySelectorAll("li")).toHaveLength(1200);
});

it("真实列表补货同步报表；报表展开与收起保留编辑草稿和盘点", async () => {
  const host = await mount(<TestApp />);
  await click("记录 1 次");
  await click("查看分类报表");
  expect(host.querySelector("table").textContent).toContain("4788.00");
  const mouse = [...host.querySelectorAll("article")].find((card) => card.textContent.includes("P002"));
  await click("补 1 件", mouse);
  expect(host.querySelector("table").textContent).toContain("4917.00");
  await click("编辑", mouse);
  const name = host.querySelector('input[name="name"]');
  await fill(name, "无线鼠标草稿");
  await click("收起分类报表"); await click("查看分类报表");
  expect(host.querySelector('input[name="name"]')).toBe(name);
  expect(name.value).toBe("无线鼠标草稿");
  expect(host.textContent).toContain("已记录 1 次盘点操作");
});
