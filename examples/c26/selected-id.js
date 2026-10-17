import { products } from "../shared/products.js";
import { updateProduct } from "../inventory/04-react/src/product-state.js";

const selectedId = "P002";
const selectedCopy = products.find((product) => product.id === selectedId);
const updated = updateProduct(products, selectedId, { stock: 3 });
const selectedNow = updated.find((product) => product.id === selectedId);
console.log(selectedCopy.stock, selectedNow.stock); // → 0 3
console.log(updated.reduce((sum, product) => sum + product.stock, 0)); // → 55
