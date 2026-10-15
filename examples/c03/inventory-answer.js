function parseQuantity(text) {
  if (text.trim() === "") return null;
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) return null;
  if (quantity < 1 || quantity > 99999) return null;
  return quantity;
}

const product = { id: "P002", name: "无线鼠标", stock: 0, priceCents: 12900 };
const rawAmount = "3"; // 补货输入框读到的文本

const stock = product.stock ?? 12;
const amount = parseQuantity(rawAmount);

if (amount === null) {
  console.log("补货数量无效");
} else {
  const newStock = stock + amount;
  const valueCents = newStock * product.priceCents;
  console.log("补货后库存", newStock);
  console.log("库存价值", (valueCents / 100).toFixed(2), "元");
}
