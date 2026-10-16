// 有问题的写法：try 只包住启动，失败发生在稍后的 Promise 中
import { loadStock } from "./mock-api.js";

async function read() {
  try {
    return loadStock("P002", { fail: true });
  } catch (error) {
    console.log("内部处理", error.message);
    return 0;
  }
}
read().then(stock => console.log("库存", stock))
  .catch(error => console.log("外部处理", error.message));
