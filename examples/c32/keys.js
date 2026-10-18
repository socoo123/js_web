import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
client.setQueryData(["products", "detail", "P001"], { stock: 12 });
console.log(client.getQueryData(["products", "detail", "P001"]).stock);
console.log(client.getQueryData(["products", "detail", "P002"]));
client.setQueryData(["products", { category: "外设", order: "stock" }], 2);
console.log(client.getQueryData(["products", { order: "stock", category: "外设" }]));
client.clear();
