// 有问题的写法：forEach 丢弃回调返回的 Promise
import { loadStock } from "./mock-api.js";

async function report() {
  const stocks = [];
  await ["P001", "P002"].forEach(async id => {
    stocks.push(await loadStock(id));
  });
  console.log("完成数量", stocks.length);
}
report();
