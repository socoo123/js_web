const mouse = { id: "P002", stock: 0 };
const copy = { ...mouse };
const index = new Map([[mouse, "已选中"]]);
console.log(mouse === copy);
console.log(mouse.id === copy.id);
console.log(index.has(copy));
console.log(mouse.stock ?? 12);
