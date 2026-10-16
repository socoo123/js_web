// 有问题的写法：每次显示都向同一个按钮增加新函数
const button = document.querySelector("#restock");
const stockNode = document.querySelector("#stock");
let stock = 12;
function render() {
  stockNode.textContent = String(stock);
  button.addEventListener("click", () => { stock += 1; render(); });
}
render();
