function createStockLimit(initial) {
  let limit = initial;
  return {
    accepts: stock => stock <= limit,
    setLimit: value => { limit = value; },
  };
}
const lowStock = createStockLimit(5);
console.log(lowStock.accepts(3)); // → true
lowStock.setLimit(2);
console.log(lowStock.accepts(3)); // → false
