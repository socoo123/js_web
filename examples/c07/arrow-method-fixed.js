"use strict";
function createStockView() {
  return { stock: 12, readStock() { return this.stock; } };
}
const view = createStockView();
console.log(view.readStock()); // → 12
console.log(view.readStock.call({ stock: 3 })); // → 3
