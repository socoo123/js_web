const stockNode = document.querySelector("#stock");
const amountInput = document.querySelector("#amount");
const feedback = document.querySelector("#feedback");
let stock = 12;

function handleRestock() {
  // 有问题的写法：直接拿输入框的 value 参与加法
  const amount = amountInput.value;
  stock = stock + amount;
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 " + amount + " 件。";
}

document.querySelector("#restock-button").addEventListener("click", handleRestock);
