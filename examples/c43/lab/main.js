import "./components.js";
import "./style.css";
import { products } from "../../shared/products.js";
import { parseAmount, restock } from "./restock.js";
import { setTheme, getTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage, getLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

const select = document.querySelector("#product");
const amount = document.querySelector("#amount");
const save = document.querySelector("#save");
const feedback = document.querySelector("#feedback");
const stock = document.querySelector("#stock");
const heading = document.querySelector("#heading");
const draft = document.querySelector("#draft");
const summary = document.querySelector("#summary");
const theme = document.querySelector("#theme");
const language = document.querySelector("#language");
const settings = document.querySelector("#settings");
let inventory = structuredClone(products);

for (const product of inventory) select.add(new Option(`${product.id} ${product.name}`, product.id));
const currentProduct = () => inventory.find((product) => product.id === select.value);

function renderProduct() {
  const product = currentProduct();
  heading.titleText = product.name;
  heading.subtitleText = `${product.id} · ${product.category}`;
  stock.textContent = `库存 ${product.stock} 件 · 单价 ${(product.priceCents / 100).toFixed(2)} 元`;
  const total = inventory.reduce((sum, item) => sum + item.stock, 0);
  const value = inventory.reduce((sum, item) => sum + item.stock * item.priceCents, 0);
  summary.textContent = `${inventory.length} 件商品 · 总库存 ${total} · 库存价值 ${(value / 100).toFixed(2)} 元`;
}

function updateDraft() {
  const next = restock(currentProduct(), amount.value);
  amount.valueState = next === null ? "Negative" : "None";
  save.disabled = next === null;
  draft.textContent = next === null
    ? "请输入 1–99999 的整数，补货后库存最多 99999。"
    : `输入 ${amount.value}（${typeof amount.value}）· 补货后 ${next.stock} 件`;
}

amount.addEventListener("ui5-input", (event) => {
  console.log(event.type, event.target === amount, typeof event.target.value);
  updateDraft();
});
save.addEventListener("click", () => {
  const next = restock(currentProduct(), amount.value);
  if (next === null) { updateDraft(); return; }
  inventory = inventory.map((product) => product.id === next.id ? next : product);
  feedback.textContent = `${next.id} 已补货 ${parseAmount(amount.value)} 件；当前 ${next.stock} 件。`;
  renderProduct();
  updateDraft();
});
select.addEventListener("change", () => {
  feedback.textContent = "";
  renderProduct();
  updateDraft();
});

function renderSettings() { settings.textContent = `主题 ${getTheme()} · 组件语言 ${getLanguage()}`; }
async function changeSetting(control, apply, value) {
  control.disabled = true;
  try { await apply(value); renderSettings(); }
  catch { settings.textContent = "资源加载失败，请检查 Network 后重试。"; }
  finally { control.disabled = false; }
}
theme.addEventListener("change", () => changeSetting(theme, setTheme, theme.value));
language.addEventListener("change", () => changeSetting(language, setLanguage, language.value));
renderProduct();
updateDraft();
renderSettings();
document.body.dataset.ready = "true";
