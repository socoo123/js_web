const stocks = [12, 0, 7];
const sorted = typeof stocks.toSorted === "function"
  ? stocks.toSorted((a, b) => a - b)
  : [...stocks].sort((a, b) => a - b);
console.log("排序", sorted.join(","));
console.log("原数组", stocks.join(","));
