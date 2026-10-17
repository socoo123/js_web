import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { countLowStock } from "./low-stock.js";

it("低库存有两种，售罄另算", () => {
  expect(countLowStock(products)).toBe(2);
});
