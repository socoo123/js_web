import seed from "../../data/products.json" with { type: "json" };
import * as inventory from "../core/inventory.js";

const products = structuredClone(seed);
window.inventory = inventory;
window.products = products;
document.querySelector("#product").textContent = inventory.describeProduct(products[0]);
