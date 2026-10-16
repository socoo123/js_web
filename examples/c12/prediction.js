setTimeout(() => {
  console.log("任务");
  Promise.resolve().then(() => console.log("任务内微任务"));
  console.log("任务尾");
}, 0);
Promise.resolve().then(() => {
  console.log("微任务一");
  queueMicrotask(() => console.log("微任务二"));
});
console.log("同步");
