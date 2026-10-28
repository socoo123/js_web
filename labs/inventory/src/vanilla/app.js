import products from "../../data/products.json" with { type: "json" };
import { describeProduct } from "../core/inventory.js";

const product = structuredClone(products[0]);
document.querySelector("#product").textContent = describeProduct(product);
