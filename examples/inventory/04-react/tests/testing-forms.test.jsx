// @vitest-environment happy-dom
import "./rtl-support.jsx";
import { it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { products } from "../../../shared/products.js";
import ProductForm from "../src/ProductForm.jsx";
import App from "../src/App.jsx";

it("空库存阻止保存并把焦点交给错误字段", async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<ProductForm product={products[1]} onSave={save} />);
  const stock = screen.getByRole("spinbutton", { name: "库存数量（必填）" });
  await user.clear(stock);
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(screen.getByRole("alert")).toHaveTextContent("保存失败");
  expect(stock).toHaveAccessibleDescription("请输入 0–99999 的整数库存。");
  expect(stock).toHaveFocus();
  expect(save).not.toHaveBeenCalled();
});

it("合法的 0 和精确金额提交为业务数字", async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<ProductForm product={products[1]} onSave={save} />);
  const price = screen.getByRole("textbox", { name: "单价（元，必填）" });
  await user.clear(price);
  await user.type(price, "0.29");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(save).toHaveBeenCalledExactlyOnceWith("P002", {
    name: "无线鼠标", category: "外设", stock: 0, priceCents: 29, tags: [],
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(products[1].priceCents).toBe(12900);
});

it("空名称提示关联到名称输入框", async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<ProductForm product={products[0]} onSave={save} />);
  const name = screen.getByRole("textbox", { name: "商品名称（必填）" });
  await user.clear(name);
  await user.type(name, "   ");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(name).toHaveAccessibleDescription("请输入 1–40 个字符的名称。");
  expect(name).toHaveFocus();
  expect(save).not.toHaveBeenCalled();
});

it("同名按钮在目标商品内查询", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/products"]}><App /></MemoryRouter>);
  expect(() => screen.getByRole("button", { name: "编辑" })).toThrow(/multiple/i);
  const mouse = screen.getByRole("article", { name: "无线鼠标" });
  await user.click(within(mouse).getByRole("button", { name: "编辑" }));
  expect(screen.getByRole("form", { name: "编辑 P002" })).toBeInTheDocument();
  expect(screen.getByRole("spinbutton", { name: "库存数量（必填）" })).toHaveValue(0);
});

it("新建后编辑商品，卡片和统计一起更新", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/products"]}><App /></MemoryRouter>);
  await user.click(screen.getByRole("button", { name: "新增示例商品" }));
  const card = screen.getByRole("article", { name: "新商品" });
  expect(card).toHaveTextContent("P007");
  await user.click(within(card).getByRole("button", { name: "编辑" }));
  const name = screen.getByRole("textbox", { name: "商品名称（必填）" });
  await user.clear(name);
  await user.type(name, "随身转接头");
  const stock = screen.getByRole("spinbutton", { name: "库存数量（必填）" });
  await user.clear(stock);
  await user.type(stock, "3");
  const price = screen.getByRole("textbox", { name: "单价（元，必填）" });
  await user.clear(price);
  await user.type(price, "0.29");
  expect(screen.getByText(/全部：7 种/)).toHaveTextContent("总库存 52 件");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(screen.getByRole("article", { name: "随身转接头" })).toHaveTextContent("库存：3 件");
  expect(screen.getByText(/全部：7 种/)).toHaveTextContent("总库存 55 件 · 库存总价值 ¥26348.87");
  expect(screen.queryByRole("form", { name: "编辑 P007" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "库存管理" })).toHaveFocus();
});
