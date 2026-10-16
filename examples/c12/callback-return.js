import { readProducts } from "./callback-api.js";

const result = readProducts((error, rows) => {
  if (error) console.log(error.message);
  else console.log("回调收到", rows.length);
  return rows;
});
console.log("同步返回", result);
