import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import seed from "../data/products.json" with { type: "json" };
import App from "../src/react/App.jsx";
import { nextProductId, updateStock } from "../src/core/inventory.js";

afterEach(() => { cleanup(); vi.useRealTimers(); });
const rowFor = (id) => document.querySelector(`article[data-id="${id}"]`);
function start() { return render(<React.StrictMode><App /></React.StrictMode>); }

test("C24 补货同时更新实际卡片和汇总，旧商品不变", () => {
  const before = structuredClone(seed);
  const next = updateStock(before, "P001", 13);
  expect(next).not.toBe(before);
  expect(next[0]).not.toBe(before[0]);
  expect(next[1]).toBe(before[1]);
  expect(before).toEqual(seed);
  start();
  fireEvent.click(within(rowFor("P001")).getByRole("button", { name: "立即补一件" }));
  expect(rowFor("P001").textContent).toContain("库存 13 件");
  expect(document.querySelector("#summary").textContent).toBe("库存 53 / 价值 2674700 分");
  expect(seed[0].stock).toBe(12);
});

test("C24 商品统一放 state 后仍满足连续 15 与延迟交错 16", async () => {
  vi.useFakeTimers();
  const view = start();
  fireEvent.click(within(rowFor("P001")).getByRole("button", { name: "连续补三件" }));
  expect(within(rowFor("P001")).getByRole("status").textContent).toContain("15 件");
  view.unmount();
  start();
  fireEvent.click(within(rowFor("P001")).getByRole("button", { name: "延迟补三件" }));
  fireEvent.click(within(rowFor("P001")).getByRole("button", { name: "立即补一件" }));
  expect(within(rowFor("P001")).getByRole("status").textContent).toContain("13 件");
  await act(() => vi.runAllTimersAsync());
  expect(within(rowFor("P001")).getByRole("status").textContent).toContain("16 件");
  expect(document.querySelector("#summary").textContent).toContain("库存 56");
});

test("C24 删除首行及排序后备注仍属于原商品 id", () => {
  start();
  fireEvent.change(screen.getByLabelText("P001 行备注"), { target: { value: "键盘待盘点" } });
  fireEvent.change(screen.getByLabelText("P002 行备注"), { target: { value: "鼠标待盘点" } });
  fireEvent.click(screen.getByRole("button", { name: "删除 P001", exact: true }));
  expect(screen.getByLabelText("P002 行备注").value).toBe("鼠标待盘点");
  fireEvent.change(screen.getByLabelText("P004 行备注"), { target: { value: "扩展坞备注" } });
  fireEvent.change(screen.getByLabelText("排序"), { target: { value: "stock" } });
  expect(screen.getByLabelText("P004 行备注").value).toBe("扩展坞备注");
  expect(screen.getByLabelText("P002 行备注").value).toBe("鼠标待盘点");
});

test("C24 筛选与当前结果汇总随补货重算，隐藏数据没有删除", () => {
  start();
  fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "P004" } });
  expect(document.querySelectorAll("#list article").length).toBe(1);
  expect(document.querySelector("#summary").textContent).toBe("库存 3 / 价值 89700 分");
  fireEvent.click(within(rowFor("P004")).getByRole("button", { name: "立即补一件" }));
  expect(rowFor("P004").textContent).toContain("库存 4 件");
  expect(document.querySelector("#summary").textContent).toBe("库存 4 / 价值 119600 分");
  fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "" } });
  expect(document.querySelectorAll("#list article").length).toBe(6);
  expect(document.querySelector("#summary").textContent).toBe("库存 53 / 价值 2664700 分");
});

test("C24 新增编号唯一，按 id 删除，新商品保留完整字段", () => {
  start();
  const add = screen.getByRole("button", { name: "新增示例商品" });
  fireEvent.click(add); fireEvent.click(add);
  expect(rowFor("P007").textContent).toContain("新商品");
  expect(rowFor("P008").textContent).toContain("单价 0.00 元");
  fireEvent.click(screen.getByRole("button", { name: "删除 P007", exact: true }));
  expect(rowFor("P007")).toBeNull();
  expect(rowFor("P008")).not.toBeNull();
  fireEvent.click(add);
  expect(rowFor("P009")).not.toBeNull();
  expect(nextProductId([])).toBe("P001");
  expect(nextProductId([...seed, { ...seed[0], id: "P999" }])).toBeNull();
});
