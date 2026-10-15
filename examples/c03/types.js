console.log("Undefined:", typeof undefined);
console.log("Null:", typeof null);
console.log("Boolean:", typeof true);
console.log("String:", typeof "键盘");
console.log("Number:", typeof 12);
console.log("BigInt:", typeof 12n);
console.log("Symbol:", typeof Symbol("product"));
console.log("Object:", typeof { name: "键盘" });
console.log("Array:", typeof []);
console.log("Function:", typeof console.log);

let incomingStock = "12";
console.log(typeof incomingStock);
incomingStock = 12;
console.log(typeof incomingStock);

let pendingStock;
const selectedProduct = null;
console.log(pendingStock === undefined);
console.log(selectedProduct === null);
console.log(Symbol("product") === Symbol("product"));
