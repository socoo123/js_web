function parseQuantity(text) {
  if (text.trim() === "") return null; // 空输入不能当成 0
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) return null; // NaN 和小数都不是整数
  if (quantity < 1 || quantity > 99999) return null;
  return quantity;
}

console.log(parseQuantity("3"));   // → 3
console.log(parseQuantity(" 3 ")); // → 3
console.log(parseQuantity(""));    // → null
console.log(parseQuantity("3.8")); // → null
console.log(parseQuantity("3件")); // → null
console.log(parseQuantity("0"));   // → null
