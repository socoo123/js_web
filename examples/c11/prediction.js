const callbacks = [];
function handleSave() { console.log("保存"); }
const first = () => handleSave();
const second = () => handleSave();
console.log(first === second); // → false
console.log(handleSave === handleSave); // → true
callbacks.push(first, second);
for (const callback of callbacks) callback(); // → 保存、保存
