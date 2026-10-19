const stockNode = document.querySelector("#stock");
const amountInput = document.querySelector("#amount");
const feedback = document.querySelector("#feedback");
let stock = 12;

function handleRestock() {
  // 先把输入框的字符串转成数字；完整输入校验见 restock-fixed.js
  const amount = amountInput.value;
  stock = stock + Number(amount);
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 " + amount + " 件。";
}

document.querySelector("#restock-button").addEventListener("click", handleRestock);
