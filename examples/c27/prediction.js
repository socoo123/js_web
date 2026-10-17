import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const actions = [
  { type: "restocked", id: "P002" },
  { type: "restocked", id: "P002" },
  { type: "removed", id: "P001" },
];
const result = actions.reduce(productsReducer, products);
console.log(result.find((product) => product.id === "P002").stock);
console.log(result.reduce((sum, product) => sum + product.stock, 0));
console.log(products[1].stock);
