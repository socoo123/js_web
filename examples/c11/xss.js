// 有问题的写法：把外部文本当成 HTML 解析
const rawName = '<img src="missing.png" onerror="this.parentNode.dataset.executed=1">';
const unsafe = document.querySelector("#unsafe");
unsafe.innerHTML = rawName;
// 图片加载失败后，页面会显示 1，表示输入中的代码执行了
unsafe.querySelector("img")?.addEventListener("error", () => {
  document.querySelector("#result").textContent = unsafe.dataset.executed;
});
