const stockNode = document.querySelector("#stock");
const amountInput = document.querySelector("#amount");
const feedback = document.querySelector("#feedback");
let stock = 12;

function parseQuantity(text) {
  if (text.trim() === "") return null;
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) return null;
  if (quantity < 1 || quantity > 99999) return null;
  return quantity;
}

function handleRestock() {
  const amount = parseQuantity(amountInput.value);
  if (amount === null) {
    feedback.textContent = "请输入 1–99999 的整数。";
    return;
  }
  stock = stock + amount;
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 " + amount + " 件。";
}

document.querySelector("#restock-button").addEventListener("click", handleRestock);
