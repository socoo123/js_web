const inventory = products.map(product => ({ ...product, tags: [...product.tags] }));
const list = document.querySelector("#products");
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const editor = document.querySelector("#editor");
const form = document.querySelector("#stock-form");
const stockInput = document.querySelector("#stock");
const stockError = document.querySelector("#stock-error");
const feedback = document.querySelector("#feedback");
let selectedId = null;

function createRow(product) {
  const row = document.createElement("li");
  const name = document.createElement("strong");
  name.textContent = product.id + " " + product.name;
  const details = document.createElement("p");
  details.textContent = product.category + " · " + product.stock + " 件 · ¥" + (product.priceCents / 100).toFixed(2);
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = "edit";
  button.dataset.id = product.id;
  button.setAttribute("aria-label", "编辑" + product.name + "库存");
  const label = document.createElement("span");
  label.textContent = "编辑库存";
  button.append(label);
  row.append(name, details, button);
  return row;
}

function renderProducts() {
  const keyword = search.value.trim().toLowerCase();
  const visible = inventory.filter(product =>
    (category.value === "" || product.category === category.value) &&
    (product.name.toLowerCase().includes(keyword) || product.id.toLowerCase().includes(keyword))
  );
  list.replaceChildren(...visible.map(createRow));
  document.querySelector("#result-count").textContent = visible.length === 0
    ? "没有匹配的商品。" : "显示 " + visible.length + " 种商品";
}

function renderSummary() {
  const totalStock = inventory.reduce((sum, product) => sum + product.stock, 0);
  const totalCents = inventory.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
  document.querySelector("#summary").textContent =
    "全部库存 " + totalStock + " 件 · 库存总价值 ¥" + (totalCents / 100).toFixed(2);
}

function openEditor(id) {
  const product = inventory.find(product => product.id === id);
  if (product === undefined) return;
  selectedId = id;
  stockInput.value = String(product.stock);
  clearError();
  document.querySelector("#editing-name").textContent = product.id + " " + product.name;
  feedback.textContent = "";
  editor.hidden = false;
  stockInput.focus();
}

function closeEditor(id) {
  editor.hidden = true;
  selectedId = null;
  const button = list.querySelector('[data-id="' + id + '"]');
  (button ?? search).focus();
}

function parseStock(text) {
  if (text.trim() === "") return null;
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return null;
  return stock;
}

function clearError() {
  stockInput.setCustomValidity("");
  stockInput.removeAttribute("aria-invalid");
  stockError.textContent = "";
}

list.addEventListener("click", event => {
  const button = event.target.closest('button[data-action="edit"]');
  if (button === null || !list.contains(button)) return;
  openEditor(button.dataset.id);
});
search.addEventListener("input", renderProducts);
category.addEventListener("change", renderProducts);
stockInput.addEventListener("input", clearError);
stockInput.addEventListener("invalid", () => {
  stockError.textContent = "请输入 0–99999 的整数。";
  stockInput.setAttribute("aria-invalid", "true");
});
form.addEventListener("submit", event => {
  event.preventDefault();
  const stock = parseStock(stockInput.value);
  if (stock === null) {
    stockInput.setCustomValidity("请输入 0–99999 的整数。");
    stockInput.reportValidity();
    return;
  }
  const product = inventory.find(product => product.id === selectedId);
  if (product === undefined) return;
  product.stock = stock;
  renderProducts();
  renderSummary();
  feedback.textContent = product.name + "库存已保存为 " + stock + " 件。";
  closeEditor(product.id);
});
document.querySelector("#cancel").addEventListener("click", () => closeEditor(selectedId));
renderProducts();
renderSummary();
