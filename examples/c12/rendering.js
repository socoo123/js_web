const status = document.querySelector("#status");
document.querySelector("#run").addEventListener("click", () => {
  status.textContent = "加载中";
  console.log("同步 DOM", status.textContent);
  Promise.resolve().then(() => {
    console.log("微任务 DOM", status.textContent);
    const end = performance.now() + 300;
    while (performance.now() < end) { /* 模拟占用主线程的计算 */ }
    status.textContent = "完成";
    console.log("计算结束", status.textContent);
  });
});
