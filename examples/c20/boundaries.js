import { products } from "../shared/products.js";
import { Inventory } from "../inventory/01-core/inventory.js";
import { createReport } from "../inventory/03-tooling/report.js";

console.log(JSON.stringify(new Inventory([]).summary()));
for (const stock of [0, 1, 5, 6]) {
  const inventory = new Inventory([{ ...products[3], stock }]);
  console.log(stock, inventory.summary().lowStockCount);
}
for (const rows of [null, undefined, [{ ...products[0], stock: "12" }]]) {
  try { createReport(rows); }
  catch (error) { console.log(error.message); }
}
