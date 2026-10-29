import React from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import products from "../data/products.json" with { type: "json" };
import App from "../src/react/App.jsx";
import { ProductCard } from "../src/react/ProductCard.jsx";

afterEach(cleanup);

test("C21 当前 App 渲染六件固定商品，不是六个未知标签", () => {
  const { container } = render(<React.StrictMode><App /></React.StrictMode>);
  expect(container.querySelectorAll("#list article").length).toBe(6);
  for (const product of products) {
    const card = container.querySelector(`article[data-id="${product.id}"]`);
    expect(card).not.toBeNull();
    expect(within(card).getByRole("heading", { level: 2 }).textContent).toBe(`${product.id} ${product.name}`);
    expect(card.textContent).toContain(`库存 ${product.stock} 件`);
  }
  expect(container.querySelector('article[data-id="P002"]').textContent).toContain("单价 129.00 元");
});

test("C21 卡片从 product 取值并保留 children 插槽", () => {
  const { container } = render(<ProductCard product={products[0]}><p>额外说明</p></ProductCard>);
  expect(container.textContent).toContain("P001 机械键盘");
  expect(container.textContent).toContain("单价 399.00 元");
  expect(container.textContent).toContain("额外说明");
});
