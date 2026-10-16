console.log(isAvailable(12)); // → true
function isAvailable(stock) {
  return stock > 0;
}

const isSoldOut = function (stock) {
  return stock === 0;
};
const stockLabel = stock => `库存 ${stock} 件`;
const savedLabel = stockLabel;
console.log(isSoldOut(0)); // → true
console.log(savedLabel(12)); // → 库存 12 件
console.log(typeof savedLabel, savedLabel === stockLabel); // → function true
