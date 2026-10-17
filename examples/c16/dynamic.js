import { products } from "../shared/products.js";

console.log("准备导入");
const report = await import("./report.js");
console.log(report.totalStock(products));
const again = await import("./report.js");
console.log(report === again);
