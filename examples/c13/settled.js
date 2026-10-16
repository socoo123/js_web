import { loadStock } from "./mock-api.js";

async function readAvailable() {
  const ids = ["P001", "P002"];
  const results = await Promise.allSettled([
    loadStock("P001"),
    loadStock("P002", { fail: true }),
  ]);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(ids[index], "库存", result.value);
    } else {
      console.log(ids[index], "失败", result.reason.message);
    }
  });
}
readAvailable();
