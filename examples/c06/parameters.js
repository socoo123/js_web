function label(name = "未命名") {
  return name;
}
console.log(label());          // → 未命名
console.log(label(undefined)); // → 未命名
console.log(label(""));        // → 空行
console.log(label(null));      // → null

function sumStock(...stocks) {
  let total = 0;
  for (const stock of stocks) total += stock;
  return total;
}
console.log(sumStock(12, 0, 7, 3, 25, 5)); // → 52
console.log(sumStock());                  // → 0
