import { readProducts, readStock } from "./callback-api.js";

readProducts((error, rows) => {
  if (error) {
    console.log(error.message);
    return;
  }
  const soldOut = rows.find(product => product.stock === 0);
  readStock(soldOut.id, (error, stock) => {
    if (error) {
      console.log(error.message);
      return;
    }
    console.log(soldOut.id, "库存", stock);
  });
});
