import { loadProducts } from "./mock-api.js";

loadProducts({ fail: true })
  .catch(error => {
    console.log("记录", error.message);
    throw error;
  })
  .then(rows => {
    console.log("成功结果", rows);
  })
  .catch(error => console.log("显示错误", error.message));
