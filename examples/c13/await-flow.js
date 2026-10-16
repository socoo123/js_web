import { loadStock } from "./mock-api.js";

async function showStock() {
  let loading = true;
  try {
    const stock = await loadStock("P002", { fail: true });
    console.log("库存", stock);
  } catch (error) {
    console.log("错误", error.message);
  } finally {
    loading = false;
    console.log("加载中", loading);
  }
}
showStock();
