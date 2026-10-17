import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { products } from "../../../shared/products.js";
import TagsBroken from "./TagsBroken.jsx";

it("无标签的商品不显示孤立数字 0", () => {
  const html = renderToStaticMarkup(<TagsBroken product={products[1]} />);
  expect(html).not.toMatch(/>0</);
});
