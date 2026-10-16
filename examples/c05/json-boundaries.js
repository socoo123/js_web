console.log(JSON.stringify({ note: undefined, stock: NaN })); // → {"stock":null}
console.log(JSON.stringify([undefined, NaN])); // → [null,null]
const timestamp = new Date("2026-10-15T01:30:00Z");
const restored = JSON.parse(JSON.stringify({ updatedAt: timestamp }));
console.log(restored.updatedAt, typeof restored.updatedAt);
// → 2026-10-15T01:30:00.000Z string
try {
  JSON.stringify({ orderId: 123n });
} catch (error) {
  console.log(error.name); // → TypeError
}
