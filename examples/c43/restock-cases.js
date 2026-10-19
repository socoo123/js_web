import { products } from "../shared/products.js";
import { restock } from "./lab/restock.js";

const mouse = products.find((product) => product.id === "P002");
for (const text of ["3", "", "3.8", "3件", "0"]) {
  console.log(JSON.stringify(text), restock(mouse, text)?.stock ?? "无效");
}
console.log("原库存", mouse.stock);
console.log("超上限", restock({ ...mouse, stock: 99998 }, "3"));
