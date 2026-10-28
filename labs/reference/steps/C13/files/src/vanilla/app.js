// region setup
import { loadProducts } from "../services/load-products.js";
import * as inventory from "../core/inventory.js";
let products = [];
let editingId = null;
const $ = (selector) => document.querySelector(selector);
window.inventory = inventory;
window.products = products;
function commit(next) {
  inventory.validateProducts(next);
  inventory.summarize(next);
  products = next;
  window.products = products;
  render();
}
// endregion setup

// region render
function render() {
  const criteria = Object.fromEntries(new FormData($("#filters")));
  const visible = inventory.selectProducts(products, criteria);
  const summary = inventory.summarize(visible);
  $("#summary").textContent = `${summary.count} 件商品 / 库存 ${summary.stock} / 价值 ${summary.valueCents} 分`;
  const cards = visible.map((product) => {
    const card = document.createElement("article");
    card.dataset.id = product.id;
    const title = document.createElement("h2");
    title.textContent = `${product.id} ${product.name}`;
    const stock = document.createElement("p");
    stock.textContent = `库存 ${product.stock} 件`;
    card.append(title, stock);
    for (const [action, text] of [["restock", "补 1 件"], ["edit", "编辑"]]) {
      const button = document.createElement("button");
      button.type = "button"; button.dataset.action = action;
      button.textContent = text; card.append(button);
    }
    return card;
  });
  $("#list").replaceChildren(...cards);
}
// endregion render

// region select
function openEditor(id) {
  editingId = id;
  const product = products.find((item) => item.id === id);
  $("#edit-title").textContent = `编辑 ${id}`;
  $("#stock").value = String(product.stock);
  $("#stock-error").textContent = "";
  $("#stock").removeAttribute("aria-invalid");
  $("#editor").hidden = false;
  $("#stock").focus();
}
$("#list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !$("#list").contains(button)) return;
  const id = button.closest("article").dataset.id;
  if (button.dataset.action === "edit") return openEditor(id);
  try {
    const product = products.find((item) => item.id === id);
    commit(inventory.updateStock(products, id, inventory.restockProduct(product, "1").stock));
    $("#feedback").textContent = `${id} 已补 1 件`;
  } catch (error) { $("#feedback").textContent = error.message; }
});
// endregion select

// region save
$("#editor").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const stock = inventory.parseStock($("#stock").value);
    commit(inventory.updateStock(products, editingId, stock));
    $("#editor").hidden = true;
    $("#feedback").textContent = `${editingId} 已保存`;
    restoreFocus();
  } catch (error) {
    $("#stock-error").textContent = error.message;
    $("#stock").setAttribute("aria-invalid", "true");
    $("#stock").focus();
  }
});
// endregion save

// region reload
let pending;
async function reloadProducts(options = {}) {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  $("#feedback").textContent = "加载中";
  try {
    const loaded = await loadProducts({ ...options, signal: controller.signal });
    if (!controller.signal.aborted) {
      commit(loaded);
      $("#feedback").textContent = loaded.length ? "加载完成" : "没有商品";
    }
  } catch (error) {
    if (error.name !== "AbortError") $("#feedback").textContent = error.message;
  } finally {
    if (pending === controller) pending = null;
  }
}
$("#reload").addEventListener("click", () => reloadProducts());
$("#fail").addEventListener("click", () => reloadProducts({ url: "./missing.json" }));
// endregion reload

// region finish
function restoreFocus() {
  const button = $(`#list article[data-id="${editingId}"] button[data-action="edit"]`);
  (button ?? $("#filters input")).focus();
}
$("#cancel").addEventListener("click", () => {
  $("#editor").hidden = true;
  restoreFocus();
});
$("#filters").addEventListener("input", () => { render(); reloadProducts(); });
reloadProducts();
// endregion finish
