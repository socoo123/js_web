const detailed = { id: "P001", warehouse: { city: "上海" } };
const brief = { id: "P002" };
const selected = null;
console.log(detailed.warehouse?.city ?? "未提供"); // → 上海
console.log(brief.warehouse?.city ?? "未提供");    // → 未提供
console.log(selected?.warehouse?.city ?? "未提供"); // → 未提供
console.log(({ stock: 0 }).stock ?? 12); // → 0
