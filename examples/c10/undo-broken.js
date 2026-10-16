// 有问题的写法：把正在修改的对象本身存进历史
const product = { id: "P001", stock: 12 };
const history = [];
history.push(product);
product.stock += 3;
const previous = history.pop();
product.stock = previous.stock;
console.log(product.stock); // → 15，撤销没有回到 12
