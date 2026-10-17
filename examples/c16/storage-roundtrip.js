import { products } from "../shared/products.js";
import { encodeSnapshot, decodeSnapshot, readSavedProducts, saveProducts } from "../inventory/02-web/storage.js";

let saved = null;
const storage = { getItem: () => saved, setItem: (key, text) => { saved = text; } };
console.log(readSavedProducts(storage));
saveProducts(products, storage);
console.log(readSavedProducts(storage).length);
console.log(decodeSnapshot(encodeSnapshot([])).length);
try { decodeSnapshot('{"version":2,"products":[]}'); }
catch (error) { console.log(error.message); }
