// C02 的输入 value 是字符串；这里固定输入，专注观察类型。
const rawQuantity = "3";
const currentStock = 12;

console.log(typeof rawQuantity);
console.log(currentStock + rawQuantity);
console.log(currentStock - rawQuantity);

const quantity = Number(rawQuantity);
console.log(typeof quantity);
console.log(currentStock + quantity);
