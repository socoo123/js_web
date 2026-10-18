import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";
import { products } from "../shared/products.js";

const client = createInventoryQueryClient();
let calls = 0;
const options = {
  queryKey: ["products", "detail", "P001"],
  queryFn: async () => { calls++; return structuredClone(products[0]); },
};
await Promise.all([client.fetchQuery(options), client.fetchQuery(options)]);
console.log("同时读取", calls);
await client.fetchQuery(options);
console.log("再次读取", calls);
console.log("缓存库存", client.getQueryData(options.queryKey).stock);
client.clear();
