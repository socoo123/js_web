const stockMethods = {
  label: "库存",
  readStock() { return this.stock; },
};
const keyboard = Object.create(stockMethods);
keyboard.id = "P001";
keyboard.stock = 12;
console.log(keyboard.readStock());                    // → 12
console.log(Object.hasOwn(keyboard, "readStock"));     // → false
console.log("readStock" in keyboard);                 // → true
console.log(Object.getPrototypeOf(keyboard) === stockMethods); // → true
keyboard.label = "现货";
console.log(keyboard.label);                         // → 现货
delete keyboard.label;
console.log(keyboard.label);                         // → 库存
console.log(keyboard.missing);                       // → undefined
