import { loadProducts } from "./mock-api.js";

let loading = true;
loadProducts({ fail: true })
  .then(rows => rows.length)
  .catch(error => {
    console.log("错误", error.message);
    return 0;
  })
  .finally(() => {
    loading = false;
    console.log("加载中", loading);
  })
  .then(count => console.log("展示数量", count));
