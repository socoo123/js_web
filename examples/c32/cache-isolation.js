import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const first = createInventoryQueryClient();
const second = createInventoryQueryClient();
const key = ["products", "detail", "P001"];
first.setQueryData(key, { stock: 12 });
console.log(first.getQueryData(key).stock);
console.log(second.getQueryData(key));
first.clear();
second.clear();
