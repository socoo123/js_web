import { createCategoryFilter } from "../01-core/inventory.js";

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

export function renderList(inventory, { keyword, category }, list, result) {
  const matchesCategory = createCategoryFilter(category);
  const visible = inventory.select(product =>
    (category === "" || matchesCategory(product)) &&
    (product.name.toLowerCase().includes(keyword) || product.id.toLowerCase().includes(keyword))
  );
  list.replaceChildren(...visible.map(createRow));
  result.textContent = visible.length === 0
    ? (inventory.count() === 0 ? "暂无商品。" : "没有匹配的商品。") : "显示 " + visible.length + " 种商品";
}

export function renderSummary(inventory, node) {
  const { totalStock, totalValueCents } = inventory.summary();
  node.textContent = "全部库存 " + totalStock + " 件 · 库存总价值 ¥" + (totalValueCents / 100).toFixed(2);
}
