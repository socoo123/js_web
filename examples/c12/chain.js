import { loadProducts, loadStock } from "./mock-api.js";

loadProducts()
  .then(rows => rows.find(product => product.stock === 0))
  .then(product => loadStock(product.id))
  .then(stock => console.log("库存", stock))
  .catch(error => console.log(error.message));
