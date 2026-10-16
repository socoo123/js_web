const quantities = [0, 12, 3];
const processed = [];
for (let head = 0; head < quantities.length; head++) {
  processed.push(quantities[head]);
}
console.log(processed.join(", ")); // → 0, 12, 3
console.log(quantities.length); // → 3，按下标读取保留了原数组
