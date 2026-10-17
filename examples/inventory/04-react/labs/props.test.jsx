import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { products } from "../../../shared/products.js";
import ProductListBroken from "./ProductListBroken.jsx";

it("列表中的无线鼠标保留自己的名称和库存", () => {
  const html = renderToStaticMarkup(<ProductListBroken products={products.slice(0, 2)} />);
  expect(html).toContain("无线鼠标");
  expect(html).toContain(">0</strong>");
});
