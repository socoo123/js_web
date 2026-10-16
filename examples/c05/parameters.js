function change(record) {
  record.stock = 15;
  record = { id: "P002", stock: 0 };
  console.log("函数内", record.stock); // → 函数内 0
}
const current = { id: "P001", stock: 12 };
change(current);
console.log("调用后", current.id, current.stock); // → 调用后 P001 15
