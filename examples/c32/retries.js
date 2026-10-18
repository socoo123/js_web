import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
let attempts = 0;
try {
  await client.fetchQuery({
    queryKey: ["products", "detail", "P001"],
    queryFn: async () => { attempts++; throw new Error("模拟读取失败"); },
    retry: 1,
    retryDelay: 0,
  });
} catch (error) {
  console.log(error.message);
}
console.log("实际尝试", attempts);
client.clear();
