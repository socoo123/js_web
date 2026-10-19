import { expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { products } from "../shared/products.js";
import { parseAmount, restock } from "./lab/restock.js";

test("售罄补货保留原对象，按数字相加并遵守库存上限", () => {
  const product = products.find((item) => item.id === "P002");
  expect(restock(product, "3")).toEqual({ ...product, stock: 3 });
  expect(product.stock).toBe(0);
  expect(restock({ ...product, stock: 99998 }, "1")?.stock).toBe(99999);
  expect(restock({ ...product, stock: 99998 }, "2")).toBeNull();
});

test("无效文本不参与补货，合法文本转换后进入业务", () => {
  for (const text of ["", " ", "3.8", "3件", "-1", "0", "100000", "Infinity"])
    expect(parseAmount(text)).toBeNull();
  expect(parseAmount(" 3 ")).toBe(3);
});
