import { loadStock } from "./mock-api.js";

async function readBoth() {
  const requests = ["P001", "P002"].map(id => {
    console.log("启动", id);
    return loadStock(id);
  });
  console.log("两个读取均已启动");
  const [first, second] = await Promise.all(requests);
  console.log("库存", first, second);
}
readBoth();
