function sumStock(quantities) {
  let total = 0;
  for (let index = 0; index < quantities.length; index++) {
    const quantity = quantities[index];
    total = total + quantity;
  }
  return total;
}

const quantities = [12, 0, 7, 3]; // P001–P004 的库存
console.log("total", sumStock(quantities)); // → total 22
console.log("empty", sumStock([]));         // → empty 0
console.log("zero", sumStock([0]));         // → zero 0
