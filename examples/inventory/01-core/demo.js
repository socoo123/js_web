import { products } from "../../shared/products.js";
import { createCategoryFilter } from "./inventory.js";

const isPeripheral = createCategoryFilter("外设");
const isAccessory = createCategoryFilter("配件");
const peripherals = [];
const accessories = [];
for (const product of products) {
  if (isPeripheral(product)) peripherals.push(product.id);
  if (isAccessory(product)) accessories.push(product.id);
}
console.log("外设：", peripherals.join(", "));
console.log("配件：", accessories.join(", "));
console.log("原始商品数：", products.length);
