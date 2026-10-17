import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductCard from "../src/ProductCard.jsx";
import { products } from "../../../shared/products.js";

it("展示机械键盘的名称、库存和按元显示的单价", () => {
  const html = renderToStaticMarkup(<ProductCard product={products[0]} />);
  expect(html).toContain("机械键盘");
  expect(html).toContain(">12</strong>");
  expect(html).toContain("399.00");
  expect(html).not.toContain("product.name");
});
