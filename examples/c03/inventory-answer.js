// 参考答案：输入是文本，库存和金额在业务计算前转为经过检查的数字。
const savedStock = 0;
const stock = savedStock ?? 12;
const rawQuantity = "3";
const quantity = Number(rawQuantity);
const validQuantity = rawQuantity.trim() !== "" &&
  Number.isSafeInteger(quantity) && quantity > 0;
const validStock = Number.isSafeInteger(stock) && stock >= 0;
const unitPriceCents = 10;
const validPrice = Number.isSafeInteger(unitPriceCents) && unitPriceCents >= 0;

console.log("stock", stock);
console.log("validQuantity", validQuantity);
console.log("validStock", validStock);
console.log("validPrice", validPrice);

if (validStock && validQuantity) {
  const restocked = stock + quantity;
  if (Number.isSafeInteger(restocked)) {
    console.log("restocked", restocked);
  } else {
    console.log("restock rejected: unsafe integer");
  }
}

if (validPrice && validQuantity) {
  const totalCents = unitPriceCents * quantity;
  if (Number.isSafeInteger(totalCents)) {
    console.log("totalCents", totalCents);
    console.log("totalYuan", (totalCents / 100).toFixed(2));
  } else {
    console.log("price rejected: unsafe integer");
  }
}
