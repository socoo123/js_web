const saleForm = document.querySelector("#sale-form");
const quantityInput = document.querySelector("#quantity");
const stockNode = document.querySelector("#stock");
const feedback = document.querySelector("#feedback");
const sellButton = document.querySelector("#sell-button");
let stock = 12;

function handleSale(event) {
  // 本课在页面内处理表单，不执行默认的导航提交。
  event.preventDefault();
  const quantity = Number(quantityInput.value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    feedback.textContent = "请输入大于 0 的整数。";
    return;
  }

  if (quantity > stock) {
    feedback.textContent = "库存不足，当前只有 " + stock + " 件。";
    return;
  }

  const remaining = stock - quantity;
  stock = remaining;
  stockNode.textContent = String(stock);
  feedback.textContent = "已售出 " + quantity + " 件，剩余 " + stock + " 件。";
  sellButton.disabled = stock === 0;
  console.log("库存变化", stock);
}

saleForm.addEventListener("submit", handleSale);
sellButton.disabled = false;
feedback.textContent = "填写数量后，点击确认售出。";
console.log("C02 ready");
