"use strict";
const keyboard = {
  id: "P001", stock: 12,
  readStock() { return this.stock; },
};
const dock = { id: "P004", stock: 3, readStock: keyboard.readStock };
console.log(keyboard.readStock()); // → 12
console.log(dock.readStock());     // → 3
console.log(keyboard.readStock === dock.readStock); // → true
