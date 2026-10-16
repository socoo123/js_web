const keyboard = { id: "P001", stock: 12 };
const copied = { ...keyboard };
const notes = new Map([[keyboard, "待盘点"]]);
console.log(notes.get(keyboard)); // → 待盘点
console.log(notes.get(copied)); // → undefined
notes.set(copied, "另一个对象");
console.log(notes.size); // → 2
console.log(new Map([[12, "数字"], ["12", "文本"]]).size); // → 2
