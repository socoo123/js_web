// 有问题的写法：用任务值是否为 truthy 判断队列是否结束
const quantities = [0, 12, 3];
const processed = [];
let quantity;
while ((quantity = quantities.shift())) {
  processed.push(quantity);
}
console.log(processed.join(", ")); // → 空行
console.log(quantities.length); // → 2
