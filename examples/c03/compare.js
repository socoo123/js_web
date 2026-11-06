console.log(3 === "3");
console.log(3 == "3");
console.log(NaN === NaN, Number.isNaN(NaN));
const keyboard = { id: "P001", stock: 12 };
const alias = keyboard;
const copy = { id: "P001", stock: 12 };
console.log(keyboard === alias);
console.log(keyboard === copy);
console.log(keyboard.id === copy.id);
