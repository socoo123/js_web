import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
let remoteStock = 12;
const options = {
  queryKey: ["products", "detail", "P001"],
  queryFn: async () => ({ stock: remoteStock }),
};
await client.fetchQuery(options);
remoteStock = 13;
console.log("写入后缓存", client.getQueryData(options.queryKey).stock);
await client.invalidateQueries({ queryKey: options.queryKey, exact: true });
console.log("失效后缓存", client.getQueryData(options.queryKey).stock);
console.log("是否失效", client.getQueryState(options.queryKey).isInvalidated);
console.log("重新读取", (await client.fetchQuery(options)).stock);
client.clear();
