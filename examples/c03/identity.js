const keyboard = { id: "P001", stock: 12 };
const sameKeyboard = keyboard;
const copied = { id: "P001", stock: 12 };

console.log(keyboard === sameKeyboard); // → true，同一个对象
console.log(keyboard === copied);       // → false，内容相同，但是两个对象
console.log(keyboard.id === copied.id); // → true，字符串按内容比较
