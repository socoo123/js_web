// 有问题的写法：默认库存、补货计算和数量校验各有一个 bug
const product = { id: "P002", name: "无线鼠标", stock: 0, priceCents: 12900 };
const rawAmount = "3"; // 补货输入框读到的文本

const stock = product.stock || 12;
const amount = Number.parseInt(rawAmount, 10);

if (Number.isNaN(amount)) {
  console.log("补货数量无效");
} else {
  const newStock = stock + rawAmount;
  const valueCents = newStock * product.priceCents;
  console.log("补货后库存", newStock);
  console.log("库存价值", (valueCents / 100).toFixed(2), "元");
}
