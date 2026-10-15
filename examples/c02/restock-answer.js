// 追加到 app.js 末尾；先在 form 后添加 #restock-button 按钮。
const restockButton = document.querySelector("#restock-button");

function handleRestock() {
  stock = stock + 5;
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 5 件，剩余 " + stock + " 件。";
  sellButton.disabled = false;
}

restockButton.addEventListener("click", handleRestock);
