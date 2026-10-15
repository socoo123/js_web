// 故意有问题的起始代码：售完、赠品与不合法输入处理都要检查。
const savedStock = 0;
const stock = savedStock || 12;
const rawQuantity = "3";
const quantity = Number.parseInt(rawQuantity, 10);
const unitPriceYuan = 0.1;
const totalYuan = unitPriceYuan * quantity;

console.log("stock", stock);
console.log("restocked", stock + rawQuantity);
console.log("totalYuan", totalYuan);
console.log("valid", Boolean(quantity));
