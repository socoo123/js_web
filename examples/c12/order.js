console.log("开始");
setTimeout(() => {
  console.log("定时器");
}, 0);
const ready = new Promise(resolve => {
  console.log("构造器");
  resolve(12);
  console.log("resolve 后");
});
ready.then(() => {
  console.log("Promise 回调");
  queueMicrotask(() => console.log("新微任务"));
});
queueMicrotask(() => console.log("排队的微任务"));
console.log("结束");
