// expect-error: ReferenceError
// 有问题的写法：把浏览器页面的 DOM 操作交给普通 Node 脚本执行
console.log(document.querySelector("h1").textContent);
