import money from "./format.js";
import { Inventory } from "../inventory/01-core/inventory.js";
import { products } from "../shared/products.js";

const inventory = new Inventory(products);
document.querySelector("#result").textContent = inventory.count() + " 种 · " + inventory.summary().totalStock + " 件 · " + money(inventory.summary().totalValueCents);
