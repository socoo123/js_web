import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductCardBroken from "./ProductCardBroken.jsx";

it("标题显示商品名称", () => {
  const html = renderToStaticMarkup(<ProductCardBroken />);
  expect(html).toContain(">机械键盘</h2>");
});
