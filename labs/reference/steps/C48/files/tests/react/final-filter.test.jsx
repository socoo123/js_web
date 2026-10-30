// @vitest-environment happy-dom
import React from "react";
import { expect, test } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { freshRepository } from "./support.jsx";
import { updateStock } from "../../src/core/inventory.js";
import App from "../../src/react/App.jsx";
import seed from "../../data/products.json";

test("浅复制故障：新库存正确之外，还必须保留旧值与身份", () => {
  const before = structuredClone(seed);
  const after = updateStock(before, "P002", 1);
  expect(before[1].stock).toBe(0);
  expect(after[1].stock).toBe(1);
  expect(after).not.toBe(before);
  expect(after[1]).not.toBe(before[1]);
  expect(after[0]).toBe(before[0]);
});

test("低库存排除0，与分类和搜索取交集；筛选不写业务库存", async () => {
  const user = userEvent.setup();
  const repository = freshRepository();
  render(<App inventoryRepository={repository} />);
  await screen.findByRole("heading", { name: "P001 机械键盘", exact: true });
  const before = await repository.exportText();
  await user.click(screen.getByRole("checkbox", { name: "仅低库存", exact: true }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.queryByRole("heading", { name: "P002 无线鼠标", exact: true })).not.toBeInTheDocument();
  expect(screen.getByText("库存 8 / 价值 539200 分")).toBeInTheDocument();
  await user.selectOptions(screen.getByRole("combobox", { name: "分类", exact: true }), "配件");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  await user.type(screen.getByRole("textbox", { name: "搜索", exact: true }), "P006");
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(await repository.exportText()).toBe(before);
});

test("保存8后离开低库存结果，焦点回标题；清除筛选能见已保存值", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await screen.findByRole("heading", { name: "P004 USB-C 扩展坞", exact: true });
  const low = screen.getByRole("checkbox", { name: "仅低库存", exact: true });
  await user.click(low);
  await user.click(screen.getByRole("button", { name: "编辑 P004", exact: true }));
  const form = screen.getByRole("form", { name: "商品编辑", exact: true });
  const stock = within(form).getByLabelText("库存", { exact: true });
  await user.clear(stock); await user.type(stock, "8");
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  await waitFor(() => expect(screen.queryByRole("form", { name: "商品编辑" })).not.toBeInTheDocument());
  expect(screen.queryByRole("heading", { name: "P004 USB-C 扩展坞", exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "React 库存工作台", exact: true })).toHaveFocus();
  await user.click(low);
  expect(screen.getByText("库存 57 / 价值 2784300 分")).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(6);
});
