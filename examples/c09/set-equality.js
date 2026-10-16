const first = { id: "P001" };
const second = { id: "P001" };
console.log(new Set([first, first, second]).size); // → 2
console.log(new Set([first.id, second.id]).size); // → 1
console.log(new Set([NaN, NaN, 0, -0]).size); // → 2
console.log(new Map([[NaN, "无效输入"]]).get(NaN)); // → 无效输入
