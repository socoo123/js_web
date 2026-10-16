let inventory = [];
const STORAGE_KEY = "js_web:inventory:v1";
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
  if (loadState !== "ready") return;
  const keyword = search.value.trim().toLowerCase();
  const visible = inventory.filter(product =>
    (category.value === "" || product.category === category.value) &&
    (product.name.toLowerCase().includes(keyword) || product.id.toLowerCase().includes(keyword))
  );
  list.replaceChildren(...visible.map(createRow));
  document.querySelector("#result-count").textContent = visible.length === 0
    ? (inventory.length === 0 ? "暂无商品。" : "没有匹配的商品。") : "显示 " + visible.length + " 种商品";
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
  const next = inventory.map(row => row.id === selectedId ? { ...row, stock } : row);
  try {
    commitInventory(next);
    feedback.textContent = product.name + "库存已保存为 " + stock + " 件。";
    closeEditor(product.id);
  } catch (error) {
    feedback.textContent = "保存失败，库存未修改。请允许本站存储或释放空间后重试。";
    console.error("库存保存失败", error);
  }
});
document.querySelector("#cancel").addEventListener("click", () => closeEditor(selectedId));

async function fetchProducts(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("HTTP " + response.status);
  const rows = await response.json();
  return validateProducts(rows);
}

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
    inventory = saved ?? await fetchProducts("./products.json");
    dataSource.textContent = saved === null
      ? "数据来源：初始 JSON（保存编辑后才写入本地副本）。" : "数据来源：当前浏览器的本地副本。";
    loadState = "ready";
    renderProducts();
    renderSummary();
  } catch (error) {
    loadState = "error";
    inventory = [];
    document.querySelector("#result-count").textContent = "加载失败，请检查网络后重试。";
    console.error("商品加载失败", error);
    retry.hidden = false;
  } finally {
    setLoading(false);
  }
}
retry.addEventListener("click", loadProducts);

function validateProducts(rows) {
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  const ids = new Set();
  const categories = ["外设", "显示器", "配件", "音频"];
  return rows.map(row => {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("每件商品应为对象");
    }
    if (typeof row.id !== "string" || !/^P\d{3}$/.test(row.id) || ids.has(row.id)) {
      throw new Error("商品 id 格式错误或重复");
    }
    ids.add(row.id);
    if (typeof row.name !== "string" || row.name.trim().length < 1 || row.name.trim().length > 40) {
      throw new Error("商品名称应为 1–40 个字符");
    }
    if (!categories.includes(row.category)) throw new Error("商品分类无效");
    if (!Number.isInteger(row.stock) || row.stock < 0 || row.stock > 99999) {
      throw new Error("库存应为 0–99999 的整数");
    }
    if (!Number.isSafeInteger(row.priceCents) || row.priceCents < 0) {
      throw new Error("价格分应为非负安全整数");
    }
    if (!Array.isArray(row.tags) || !row.tags.every(tag => typeof tag === "string")) {
      throw new Error("标签应为字符串数组");
    }
    return { id: row.id, name: row.name.trim(), category: row.category,
      stock: row.stock, priceCents: row.priceCents, tags: [...row.tags] };
  });
}

function encodeSnapshot(rows) {
  return JSON.stringify({ version: 1, products: validateProducts(rows) }, null, 2);
}

function decodeSnapshot(text) {
  const snapshot = JSON.parse(text);
  if (snapshot?.version !== 1) throw new Error("备份版本应为 1");
  return validateProducts(snapshot.products);
}

function readSavedProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : decodeSnapshot(raw);
  } catch (error) {
    storageFeedback.textContent = "本地副本无法读取，尝试加载初始 JSON。可导入备份或点击恢复初始数据；原存储未覆盖。";
    console.warn("本地副本读取失败", error);
    return null;
  }
}

function commitInventory(next) {
  const text = encodeSnapshot(next);
  localStorage.setItem(STORAGE_KEY, text);
  inventory = next;
  loadState = "ready";
  retry.hidden = true;
  renderProducts();
  renderSummary();
  dataSource.textContent = "数据来源：当前浏览器的本地副本。";
  storageFeedback.textContent = "已保存到当前浏览器，可导出 JSON 备份。";
}

function downloadJson(text, filename) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

exportButton.addEventListener("click", () => {
  try {
    downloadJson(encodeSnapshot(inventory), "inventory-v1.json");
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
    commitInventory(next);
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
    const next = await fetchProducts("./products.json");
    commitInventory(next);
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
