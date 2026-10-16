"use strict";
function stockAfterRestock(amount) {
  return this.stock + amount;
}
const keyboard = { id: "P001", stock: 12 };
const dock = { id: "P004", stock: 3 };
console.log(stockAfterRestock.call(keyboard, 3));    // → 15
console.log(stockAfterRestock.apply(dock, [2]));    // → 5
const readLater = stockAfterRestock.bind(keyboard, 3);
console.log(typeof readLater);                     // → function
console.log(readLater());                          // → 15
console.log(readLater.call(dock));                 // → 15
