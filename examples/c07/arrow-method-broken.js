// 有问题的写法：把对象属性里的箭头函数当成普通方法
"use strict";
function createStockView() {
  return { stock: 12, readStock: () => this.stock };
}
const view = createStockView();
try {
  console.log(view.readStock());
} catch (error) {
  console.log(error.name); // → TypeError
}
