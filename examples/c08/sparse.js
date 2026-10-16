const slots = new Array(3);
const mapped = slots.map(() => 0);
console.log(slots.length); // → 3
console.log(mapped[0], Object.hasOwn(mapped, 0)); // → undefined false
console.log(Object.hasOwn([undefined], 0)); // → true
console.log([...slots].map(() => 0).join(", ")); // → 0, 0, 0
