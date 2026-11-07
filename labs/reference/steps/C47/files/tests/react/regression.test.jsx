// @vitest-environment happy-dom
import React from "react";
import { expect, test, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { freshRepository } from "./support.jsx";
import { saveProducts, storageKey } from "../../src/services/storage.js";
import { ApiError } from "../../src/services/api-repository.js";
import App from "../../src/react/App.jsx";
import seed from "../../data/products.json";

test("非法保存抛错以后，主快照与备份原文都不变", () => {
  const records = new Map();
  const storage = { getItem: (key) => records.get(key) ?? null, setItem: (key, raw) => records.set(key, raw) };
  saveProducts(storage, seed);
  saveProducts(storage, seed);
  const before = new Map(records);
  const invalid = seed.map((product) => product.id === "P004" ? { ...product, stock: "8" } : product);
  expect(() => saveProducts(storage, invalid)).toThrow();
  expect(records.get(storageKey)).toBe(before.get(storageKey));
  expect(records).toEqual(before);
});

test("连续输入保留完整条件，清空后回到原库存", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await screen.findByRole("heading", { name: "P001 机械键盘", exact: true });
  const search = screen.getByRole("textbox", { name: "搜索", exact: true });
  await user.type(search, "P004");
  expect(search).toHaveValue("P004");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "P004 USB-C 扩展坞", exact: true })).toBeInTheDocument();
  await user.clear(search);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
  expect(screen.getByText("库存 52 / 价值 2634800 分")).toBeInTheDocument();
});

// region server-errors
async function openEditor(repository, id) {
  const user = userEvent.setup();
  render(<App inventoryRepository={repository} />);
  await user.click(await screen.findByRole("button", { name: `编辑 ${id}`, exact: true }));
  return { user, form: screen.getByRole("form", { name: "商品编辑", exact: true }) };
}
test("后端 422 的字段错误落到对应输入框，草稿与库存不变", async () => {
  const repository = freshRepository();
  vi.spyOn(repository, "save").mockRejectedValueOnce(new ApiError(422,
    { code: "VALIDATION", message: "商品字段不合法", fields: { priceCents: "价格必须是非负安全整数分" } }));
  const { user, form } = await openEditor(repository, "P004");
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  const price = within(form).getByLabelText("价格（元）", { exact: true });
  await waitFor(() => expect(price).toHaveAccessibleDescription("价格必须是非负安全整数分"));
  expect(price).toHaveAttribute("aria-invalid", "true");
  expect(price).toHaveFocus();
  expect(screen.getByText("库存 52 / 价值 2634800 分")).toBeInTheDocument();
});
test("409 冲突提示服务器上的库存并保留草稿，载入最新后才保存", async () => {
  const repository = freshRepository();
  const current = { ...seed[3], stock: 9, version: 2 };
  vi.spyOn(repository, "save").mockRejectedValueOnce(new ApiError(409, { code: "CONFLICT", message: "版本已变化", current }));
  const { user, form } = await openEditor(repository, "P004");
  const stock = within(form).getByLabelText("库存", { exact: true });
  await user.clear(stock); await user.type(stock, "8");
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  expect(await within(form).findByText("保存冲突：服务器上的 P004 已被修改（库存 9）。草稿已保留，可载入最新后再保存。")).toBeInTheDocument();
  expect(stock).toHaveValue("8");
  await user.click(within(form).getByRole("button", { name: "载入最新", exact: true }));
  expect(stock).toHaveValue("9");
  await user.clear(stock); await user.type(stock, "8");
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  await waitFor(() => expect(screen.queryByRole("form", { name: "商品编辑" })).not.toBeInTheDocument());
  expect(screen.getByText("库存 57 / 价值 2784300 分")).toBeInTheDocument();
});
test("列表读取失败后显示原因，不停在加载中，重新读取恢复", async () => {
  const user = userEvent.setup();
  const repository = freshRepository();
  vi.spyOn(repository, "list").mockRejectedValueOnce(new ApiError(500, { code: "FAULT", message: "注入的故障：500" }));
  render(<App inventoryRepository={repository} />);
  expect(await screen.findByText(/^读取失败：HTTP 500：注入的故障：500/)).toBeInTheDocument();
  expect(screen.queryByText("正在加载库存")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "重新读取", exact: true }));
  expect(await screen.findAllByRole("article")).toHaveLength(6);
});
// endregion server-errors
