const base = { id: "P002", stock: 0, warehouse: { city: "上海" } };
const { stock: picked = 12 } = base;
const copy = { ...base };
copy.stock = 3;
copy.warehouse.city = "杭州";
console.log(picked, base.stock, copy.stock);
console.log(base.warehouse.city, base === copy);
console.log(({ stock: null }).stock ?? 12);
console.log(JSON.stringify({ stock: 0, note: undefined }));
