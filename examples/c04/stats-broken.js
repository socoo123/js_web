// 有问题的写法：循环把 length 当成了最后一个有效下标
function sumStock(quantities) {
  let total = 0;
  for (let index = 0; index <= quantities.length; index++) {
    const quantity = quantities[index];
    total = total + quantity;
  }
  return total;
}

const quantities = [12, 0, 7, 3];
console.log("total", sumStock(quantities)); // → total NaN
console.log("empty", sumStock([]));         // → empty NaN
console.log("zero", sumStock([0]));         // → zero NaN
