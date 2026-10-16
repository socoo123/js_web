"use strict";
function ProductStock(id, stock) {
  this.id = id;
  this.stock = stock;
}
ProductStock.prototype.readStock = function () {
  return this.stock;
};
const keyboard = new ProductStock("P001", 12);
const mouse = new ProductStock("P002", 0);
console.log(keyboard.readStock(), mouse.readStock()); // → 12 0
console.log(Object.hasOwn(keyboard, "stock"));         // → true
console.log(Object.hasOwn(keyboard, "readStock"));     // → false
console.log(keyboard.readStock === mouse.readStock);  // → true
