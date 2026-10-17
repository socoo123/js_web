import { Inventory } from "../01-core/inventory.js";
import { validateProducts, parseStock } from "./validation.js";
import { readSavedProducts as readSnapshot, saveProducts, encodeSnapshot, decodeSnapshot } from "./storage.js";
import { fetchProducts } from "./api.js";
import { renderList, renderSummary } from "./view.js";

let inventory = new Inventory([]);
const list = document.querySelector("#products");
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const editor = document.querySelector("#editor");
const form = document.querySelector("#stock-form");
const stockInput = document.querySelector("#stock");
const stockError = document.querySelector("#stock-error");
const feedback = document.querySelector("#feedback");
const retry = document.querySelector("#retry");
const exportButton = document.querySelector("#export");
const importInput = document.querySelector("#import");
const resetButton = document.querySelector("#reset");
const storageFeedback = document.querySelector("#storage-feedback");
const dataSource = document.querySelector("#data-source");
let selectedId = null;
let loadState = "loading";

function renderProducts() {
  if (loadState !== "ready") return;
  renderList(inventory, { keyword: search.value.trim().toLowerCase(), category: category.value },
    list, document.querySelector("#result-count"));
}

function updateSummary() {
  renderSummary(inventory, document.querySelector("#summary"));
}

function openEditor(id) {
  const product = inventory.getById(id);
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
  const product = inventory.getById(selectedId);
  if (product === undefined) return;
  try {
    // Inventory 会改对象字段，先复制，再尝试保存这份候选数据。
    const next = new Inventory(validateProducts(inventory.select(() => true)));
    next.setStock(selectedId, stock);
    commitInventory(next);
    feedback.textContent = product.name + "库存已保存为 " + stock + " 件。";
    closeEditor(product.id);
  } catch (error) {
    feedback.textContent = "保存失败，库存未修改。请允许本站存储或释放空间后重试。";
    console.error("库存保存失败", error);
  }
});
document.querySelector("#cancel").addEventListener("click", () => closeEditor(selectedId));

function setLoading(value) {
  search.disabled = value;
  category.disabled = value;
  retry.disabled = value;
  exportButton.disabled = value || loadState !== "ready";
  importInput.disabled = value;
  resetButton.disabled = value;
  for (const control of document.querySelectorAll("#stock-form input, #stock-form button, #products button")) {
    control.disabled = value;
  }
  list.setAttribute("aria-busy", String(value));
}

async function loadProducts() {
  loadState = "loading";
  setLoading(true);
  retry.hidden = true;
  editor.hidden = true;
  selectedId = null;
  list.replaceChildren();
  document.querySelector("#summary").textContent = "";
  document.querySelector("#result-count").textContent = "正在加载商品…";
  try {
    const saved = readSavedProducts();
    inventory = new Inventory(saved ?? await fetchProducts());
    dataSource.textContent = saved === null
      ? "数据来源：初始 JSON（保存编辑后才写入本地副本）。" : "数据来源：当前浏览器的本地副本。";
    loadState = "ready";
    renderProducts();
    updateSummary();
  } catch (error) {
    loadState = "error";
    inventory = new Inventory([]);
    document.querySelector("#result-count").textContent = "加载失败，请检查网络后重试。";
    console.error("商品加载失败", error);
    retry.hidden = false;
  } finally {
    setLoading(false);
  }
}
retry.addEventListener("click", loadProducts);

function readSavedProducts() {
  try {
    return readSnapshot();
  } catch (error) {
    storageFeedback.textContent = "本地副本无法读取，尝试加载初始 JSON。可导入备份或点击恢复初始数据；原存储未覆盖。";
    console.warn("本地副本读取失败", error);
    return null;
  }
}

function commitInventory(next) {
  saveProducts(next.select(() => true));
  inventory = next;
  loadState = "ready";
  retry.hidden = true;
  renderProducts();
  updateSummary();
  dataSource.textContent = "数据来源：当前浏览器的本地副本。";
  storageFeedback.textContent = "已保存到当前浏览器，可导出 JSON 备份。";
}

exportButton.addEventListener("click", async () => {
  try {
    const text = encodeSnapshot(inventory.select(() => true));
    const { downloadJson } = await import("./download.js");
    downloadJson(text, "inventory-v1.json");
    feedback.textContent = "已发起 JSON 下载，请保管备份文件。";
  } catch (error) {
    feedback.textContent = "导出失败，请检查 Console 后重试。";
    console.error("库存导出失败", error);
  }
});

importInput.addEventListener("change", async () => {
  const file = importInput.files[0];
  if (file === undefined) return;
  setLoading(true);
  try {
    const next = decodeSnapshot(await file.text());
    if (!window.confirm("导入将替换全部商品，是否继续？")) return;
    commitInventory(new Inventory(next));
    editor.hidden = true;
    selectedId = null;
    feedback.textContent = "导入成功：" + next.length + " 种商品已保存到当前浏览器。";
  } catch (error) {
    feedback.textContent = "导入失败，原数据保留。请检查文件格式、字段与存储权限。";
    console.error("库存导入失败", error);
  } finally {
    importInput.value = "";
    setLoading(false);
    importInput.focus();
  }
});

resetButton.addEventListener("click", async () => {
  if (!window.confirm("恢复将用初始 JSON 替换全部商品和本地副本，是否继续？")) return;
  setLoading(true);
  feedback.textContent = "正在读取初始 JSON…";
  try {
    const next = await fetchProducts();
    commitInventory(new Inventory(next));
    editor.hidden = true;
    selectedId = null;
    dataSource.textContent = "数据来源：初始 JSON（已保存为本地副本）。";
    feedback.textContent = "已恢复初始数据并保存到当前浏览器。";
  } catch (error) {
    feedback.textContent = "恢复失败，原数据保留。请检查网络和存储权限后重试。";
    console.error("初始数据恢复失败", error);
  } finally {
    setLoading(false);
    resetButton.focus();
  }
});

loadProducts();
