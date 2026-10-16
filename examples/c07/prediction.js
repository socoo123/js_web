"use strict";
const stockMethods = { readStock() { return this.stock; } };
const keyboard = Object.create(stockMethods);
keyboard.stock = 12;
const dock = { stock: 3, readStock: keyboard.readStock };
const read = keyboard.readStock;
console.log(dock.readStock());
console.log(Object.hasOwn(keyboard, "readStock"));
console.log(read.call(dock));
try {
  console.log(read());
} catch (error) {
  console.log(error.name);
}
