const hasStock = product => product.stock > 0;
console.log(hasStock({ id: "P001", stock: 12 })); // → true
const toRow = product => ({ id: product.id, stock: product.stock });
console.log(JSON.stringify(toRow({ id: "P001", stock: 12 }))); // → {"id":"P001","stock":12}
