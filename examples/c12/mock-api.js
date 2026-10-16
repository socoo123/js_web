import { readProducts, readStock } from "./callback-api.js";

export function loadProducts(options) {
  return new Promise((resolve, reject) => {
    readProducts((error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    }, options);
  });
}

export function loadStock(id) {
  return new Promise((resolve, reject) => {
    readStock(id, (error, stock) => {
      if (error) reject(error);
      else resolve(stock);
    });
  });
}
