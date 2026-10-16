const source = { id: "P001", stock: 12, warehouse: { city: "上海", shelf: "A-03" } };
const independent = {
  ...source,
  stock: 15,
  warehouse: { ...source.warehouse, city: "杭州" },
};
console.log(source.warehouse.city, independent.warehouse.city); // → 上海 杭州
console.log(independent.warehouse === source.warehouse); // → false
console.log(independent.warehouse.shelf); // → A-03
console.log(({ stock: 15, ...source }).stock); // → 12
console.log(({ ...source, stock: 15 }).stock); // → 15
