import { products } from "../../shared/products.js";
import { Inventory, createCategoryFilter } from "./inventory.js";

const inventory = new Inventory(products);
const isPeripheral = createCategoryFilter("外设");
const isAccessory = createCategoryFilter("配件");
const peripherals = [];
const accessories = [];
for (const product of inventory.select(isPeripheral)) peripherals.push(product.id);
for (const product of inventory.select(isAccessory)) accessories.push(product.id);
console.log("外设：", peripherals.join(", "));
console.log("配件：", accessories.join(", "));
console.log("原始商品数：", inventory.count());
const selectAccessories = inventory.select.bind(inventory, isAccessory);
console.log("回调筛选配件：", selectAccessories().length);
console.log("实例自有 select：", Object.hasOwn(inventory, "select"));
console.log("独立空库存：", new Inventory([]).count());
