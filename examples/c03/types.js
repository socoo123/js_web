let quantity = "3"; // 刚从输入框读到的文本
console.log(typeof quantity); // → string
quantity = Number(quantity);
console.log(typeof quantity); // → number

console.log(typeof null);        // → object（历史遗留，null 不是对象）
console.log(typeof []);          // → object（数组也是对象）
console.log(typeof console.log); // → function
console.log(typeof notDeclared); // → undefined（未声明的名字也不报错）

const product = { id: "P001", stock: 12 };
console.log(product.stok);       // → undefined（属性名拼错了）
