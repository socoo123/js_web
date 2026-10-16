// 有问题的写法：只记录错误，后续就会走成功分支
import { loadProducts } from "./mock-api.js";

loadProducts({ fail: true })
  .catch(error => console.log("记录", error.message))
  .then(rows => {
    console.log("成功结果", rows);
  });
