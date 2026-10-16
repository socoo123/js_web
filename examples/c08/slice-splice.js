const ids = ["P001", "P002", "P003"];
const firstTwo = ids.slice(0, 2);
console.log(firstTwo.join(", ")); // → P001, P002
console.log(ids.join(", ")); // → P001, P002, P003
const removed = ids.splice(1, 1);
console.log(removed.join(", ")); // → P002
console.log(ids.join(", ")); // → P001, P003
