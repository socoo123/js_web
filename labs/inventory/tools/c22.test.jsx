import React from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import seed from "../data/products.json" with { type: "json" };
import ProductList from "../src/react/ProductList.jsx";
import Toolbar from "../src/react/Toolbar.jsx";

afterEach(cleanup);

test("C22 重复渲染列表不能写入 props 商品及其 tags", () => {
  const products = Object.freeze(seed.map((product) => Object.freeze({
    ...product, tags: Object.freeze([...product.tags]),
  })));
  const view = render(<React.StrictMode><ProductList products={products} /></React.StrictMode>);
  view.rerender(<React.StrictMode><ProductList products={products} /></React.StrictMode>);
  expect(products).toEqual(seed);
  expect(view.container.querySelectorAll("article").length).toBe(6);
  expect(view.container.querySelector('article[data-id="P002"]').textContent).toContain("无线鼠标");
  expect(view.container.querySelector('article[data-id="P002"]').textContent).toContain("库存 0 件");
});

test("C22 空列表显示明确提示而不是孤立的 0", () => {
  const { container } = render(<ProductList products={[]} />);
  expect(container.querySelectorAll("article").length).toBe(0);
  expect(screen.getByRole("status").textContent).toBe("没有匹配的商品。");
  expect(container.textContent).toBe("没有匹配的商品。");
});

test("C22 工具栏安排 children，列表按商品调用附加内容函数", () => {
  const view = render(<Toolbar count={0}><strong>优先盘点售罄商品</strong></Toolbar>);
  expect(view.container.textContent).toBe("没有商品优先盘点售罄商品");
  view.rerender(<ProductList products={seed.slice(0, 2)} renderActions={(product) => <button>{product.id} 操作</button>} />);
  expect(screen.getByRole("button", { name: "P001 操作" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "P002 操作" })).toBeTruthy();
});
