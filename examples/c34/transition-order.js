import { startTransition } from "../inventory/04-react/node_modules/react/index.js";
console.log("开始");
startTransition(() => {
  console.log("回调执行");
});
console.log("结束");
