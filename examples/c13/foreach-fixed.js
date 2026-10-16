import { loadStock } from "./mock-api.js";

async function report() {
  const stocks = await Promise.all(
    ["P001", "P002"].map(id => loadStock(id))
  );
  console.log("完成数量", stocks.length);
  console.log("总库存", stocks.reduce((sum, stock) => sum + stock, 0));
}
report();
