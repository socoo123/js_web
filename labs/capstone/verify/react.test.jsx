// @vitest-environment happy-dom
// 由 scripts/verify-capstone-workspace.mjs 复制进 C48 工作区副本的 tests/ 运行；组件由同一脚本从 L6 题目数据生成。
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import products from "../data/products.json" with { type: "json" };
import { parseStock, summarize } from "../src/core/inventory.js";
import { StockActions as StaleBuggy } from "./capstone-gen/stale-buggy.jsx";
import { StockActions as StaleFixed } from "./capstone-gen/stale-fixed.jsx";
import KeyBuggy from "./capstone-gen/key-buggy.jsx";
import KeyFixed from "./capstone-gen/key-fixed.jsx";
import { ProductDetail as RaceBuggy } from "./capstone-gen/race-buggy.jsx";
import { ProductDetail as RaceFixed } from "./capstone-gen/race-fixed.jsx";
import { Queue } from "./capstone-gen/queue.jsx";
import { element as andZero } from "./capstone-gen/and-zero.jsx";
import { Correct, List, getCalls } from "./capstone-gen/lowercase.jsx";

afterEach(() => { cleanup(); vi.useRealTimers(); });
const log = (...args) => console.log("[capstone]", ...args);

test("react-lowercase：小写名生成未知标签，组件函数不执行", () => {
  const { container } = render(<List />);
  const tags = container.querySelectorAll("#list > productcard");
  log("react-lowercase", JSON.stringify(renderToStaticMarkup(<List />).slice(0, 60)), "productcard:", tags.length, "article:", container.querySelectorAll("article").length, "ProductCard 调用:", getCalls());
  expect(tags.length).toBe(6);
  expect(container.querySelectorAll("article").length).toBe(0);
  expect(getCalls()).toBe(0);
  cleanup();
  render(<Correct />);
  expect(getCalls()).toBe(6);
});

test("react-and-zero：0 && … 渲染出 0", () => {
  const html = renderToStaticMarkup(andZero);
  log("react-and-zero", html);
  expect(html).toBe("<div>0</div>");
});

test("react-queue：12 → 34", () => {
  render(<Queue />);
  fireEvent.click(screen.getByRole("button"));
  log("react-queue", screen.getByRole("button").textContent);
  expect(screen.getByRole("button").textContent).toBe("34");
});

async function stale(Component) {
  vi.useFakeTimers();
  render(<Component />);
  fireEvent.click(screen.getByRole("button", { name: "延迟补三件" }));
  fireEvent.click(screen.getByRole("button", { name: "立即补一件" }));
  const middle = screen.getByRole("status").textContent;
  await act(async () => { vi.advanceTimersByTime(2000); });
  return [middle, screen.getByRole("status").textContent];
}

test("bug-stale-timeout：旧写法 15，updater 16", async () => {
  const buggy = await stale(StaleBuggy);
  cleanup();
  const fixed = await stale(StaleFixed);
  log("bug-stale-timeout", JSON.stringify(buggy), "→", JSON.stringify(fixed));
  expect(buggy).toEqual(["P001 当前库存 13 件", "P001 当前库存 15 件"]);
  expect(fixed).toEqual(["P001 当前库存 13 件", "P001 当前库存 16 件"]);
});

function keyCase(Component) {
  const two = [{ id: "P001", name: "机械键盘" }, { id: "P002", name: "无线鼠标" }];
  const { rerender } = render(<Component products={two} />);
  fireEvent.change(screen.getByLabelText("P001 行备注"), { target: { value: "键盘待盘点" } });
  fireEvent.change(screen.getByLabelText("P002 行备注"), { target: { value: "鼠标待盘点" } });
  rerender(<Component products={[two[1]]} />);
  return screen.getByLabelText("P002 行备注").value;
}

test("bug-index-key：删除 P001 后 P002 显示键盘备注", () => {
  const buggy = keyCase(KeyBuggy);
  cleanup();
  const fixed = keyCase(KeyFixed);
  log("bug-index-key", buggy, "→", fixed);
  expect(buggy).toBe("键盘待盘点");
  expect(fixed).toBe("鼠标待盘点");
});

async function race(Component) {
  vi.useFakeTimers();
  const { rerender } = render(<Component productId="P001" />);
  rerender(<Component productId="P002" />);
  await act(async () => { vi.advanceTimersByTime(60); });
  const early = screen.queryByRole("heading")?.textContent;
  await act(async () => { vi.advanceTimersByTime(300); });
  return [early, screen.queryByRole("heading")?.textContent];
}

test("bug-effect-race：后发先到，旧结果覆盖新选择", async () => {
  const buggy = await race(RaceBuggy);
  cleanup();
  const fixed = await race(RaceFixed);
  log("bug-effect-race", JSON.stringify(buggy), "→", JSON.stringify(fixed));
  expect(buggy).toEqual(["无线鼠标", "机械键盘"]);
  expect(fixed).toEqual(["无线鼠标", "无线鼠标"]);
});

test("tool-assert：toEqual 与 toThrow(函数) 正确，toBe 与直接调用错误", () => {
  const expected = { count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 };
  expect(summarize(products)).toEqual(expected);
  expect(() => expect(summarize(products)).toBe(expected)).toThrow();
  expect(() => parseStock(" ")).toThrow(RangeError);
  let escaped;
  try { expect(parseStock(" ")).toThrow(RangeError); } catch (error) { escaped = error; }
  log("tool-assert", "toBe 失败；直接调用在断言前抛出", escaped?.constructor.name, escaped?.message);
  expect(escaped).toBeInstanceOf(RangeError);
});
