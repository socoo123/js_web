const keyboard = { id: "P001", name: "机械键盘", stock: 12 };
const { name: productName, stock, category = "未分类" } = keyboard;
keyboard.stock = 15;
console.log(productName, stock, keyboard.stock, category);
// → 机械键盘 12 15 未分类
const { note = "暂无备注" } = { note: null };
console.log(note); // → null
