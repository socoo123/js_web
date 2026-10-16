// 有问题的写法：启动了异步操作，却没把 Promise 返回给外层链
import { loadStock } from "./mock-api.js";

Promise.resolve("P002")
  .then(id => {
    loadStock(id).then(stock => console.log("读取完成", stock));
  })
  .then(stock => {
    console.log("下一步", stock);
  });
