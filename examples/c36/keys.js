import { QueryClient } from "../inventory/04-react/node_modules/@tanstack/react-query/build/modern/index.js";

const client = new QueryClient();
client.setQueryData(["products", "detail", "P001"], { id: "P001", stock: 12 });
console.log(client.getQueryData(["products", "detail", "P002"]));
console.log(client.getQueryData(["products", "detail", "P001"]).stock);
client.clear();
