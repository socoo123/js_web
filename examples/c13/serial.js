import { loadStock } from "./mock-api.js";

async function readBoth() {
  console.log("启动 P001");
  const first = await loadStock("P001");
  console.log("启动 P002");
  const second = await loadStock("P002");
  console.log("库存", first, second);
}
readBoth();
