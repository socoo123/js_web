const tags = new Set(["热销", "新品"]);
const iterator = tags[Symbol.iterator]();
const first = iterator.next();
console.log(first.value, first.done); // → 热销 false
console.log([...iterator].join(", ")); // → 新品
console.log(iterator.next().done); // → true
console.log([...tags].join(", ")); // → 热销, 新品
const counts = { 外设: 2, 显示器: 1 };
for (const [category, count] of Object.entries(counts)) {
  console.log(category, count);
}
// → 外设 2
// → 显示器 1
