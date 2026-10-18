import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
const key = ["products", "detail", "P002"];
client.setQueryData(key, { stock: 0 });
await client.invalidateQueries({ queryKey: key, exact: true });
console.log(client.getQueryData(key).stock);
console.log(client.getQueryState(key).isInvalidated);
client.clear();
