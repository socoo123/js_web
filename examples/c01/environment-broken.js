// expect-error: ReferenceError
// 有问题的写法：把 DOM 当成所有 JS 环境都提供的能力
const reportRemaining = 12 - 3;
console.log("剩余库存：" + reportRemaining);
console.log(document.querySelector("h1").textContent);
