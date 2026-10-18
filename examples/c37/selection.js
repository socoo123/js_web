import { products as initialProducts } from "../shared/products.js";
import { selectProduct } from "./select-product.js";
import { selectProduct as selectBroken } from "./select-product-broken.js";

const broken = new URLSearchParams(location.search).get("case") === "broken";
const resolveProduct = broken ? selectBroken : selectProduct;
const rows = document.querySelector("#rows");
const editor = document.querySelector("#editor");
const stock = document.querySelector("#stock");
const error = document.querySelector("#stock-error");
const notice = document.querySelector("#notice");
let products = initialProducts;
let sorted = false;
let editingId = null;
let triggerId = null;
document.querySelector("#mode").textContent = broken ? "实验：按显示位置查找（有问题）" : "参考：按商品编号查找";

function render() {
  const visible = sorted ? products.toSorted((a, b) => a.stock - b.stock) : products;
  rows.replaceChildren();
  visible.forEach((product, index) => {
    const tr = document.createElement("tr");
    for (const value of [`${product.id} ${product.name}`, product.stock]) {
      const td = document.createElement("td");
      td.textContent = String(value);
      tr.append(td);
    }
    const cell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.id = `edit-${product.id}`;
    button.textContent = "编辑";
    button.setAttribute("aria-label", `编辑 ${product.name}`);
    button.addEventListener("click", () => openEditor({ id: product.id, index }));
    cell.append(button);
    tr.append(cell);
    rows.append(tr);
  });
  const total = products.reduce((sum, product) => sum + product.stock, 0);
  const cents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
  document.querySelector("#summary").textContent = `总库存 ${total} 件 · 库存总价值 ${(cents / 100).toFixed(2)} 元`;
}

function openEditor(row) {
  const product = resolveProduct(products, row);
  if (!product) return;
  editingId = product.id;
  triggerId = row.id;
  stock.value = String(product.stock);
  stock.removeAttribute("aria-invalid");
  error.textContent = "";
  document.querySelector("#editing-product").textContent = `${product.id} ${product.name}`;
  editor.showModal();
}

document.querySelector("#editor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = Number(stock.value);
  if (stock.value.trim() === "" || !Number.isInteger(value) || value < 0 || value > 99999) {
    error.textContent = "请输入 0–99999 的整数。";
    stock.setAttribute("aria-invalid", "true");
    stock.focus();
    return;
  }
  products = products.map((product) => product.id === editingId ? { ...product, stock: value } : product);
  render();
  notice.textContent = `已保存 ${editingId}，库存 ${value} 件。`;
  editor.close();
});
document.querySelector("#cancel").addEventListener("click", () => editor.close());
editor.addEventListener("close", () => {
  document.getElementById(`edit-${triggerId}`)?.focus();
  editingId = null;
});
document.querySelector("#sort").addEventListener("click", () => { sorted = true; render(); });
document.querySelector("#theme").addEventListener("click", (event) => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  event.currentTarget.setAttribute("aria-pressed", String(dark));
});
render();
