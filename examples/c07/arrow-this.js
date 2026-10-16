"use strict";
const keyboard = {
  id: "P001", stock: 12,
  createReader() { return () => this.stock; },
};
const dock = { id: "P004", stock: 3 };
const read = keyboard.createReader();
console.log(read());           // → 12
console.log(read.call(dock));  // → 12
keyboard.stock += 3; // 模拟补货，回调仍然读取同一件商品
console.log(read());           // → 15
