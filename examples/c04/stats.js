// S03：本文件可在浏览器普通脚本或 Node 中直接运行。
function sumStock(quantities) {
  let total = 0;
  for (let index = 0; index < quantities.length; index = index + 1) {
    const quantity = quantities[index];
    total = total + quantity;
  }
  return total;
}

const quantities = [12, 0, 7, 3];
console.log("total", sumStock(quantities));
console.log("empty", sumStock([]));
