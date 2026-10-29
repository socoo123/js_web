import seed from "../../data/products.json" with { type: "json" };
import { selectProducts, summarize } from "../../src/core/inventory.js";
import { createInventoryRepository } from "../../src/services/inventory-repository.js";

export async function createShell() {
  const repository = createInventoryRepository({ storage: null, seed });
  const search = document.querySelector("#search");
  const list = document.querySelector("#list");
  const summary = document.querySelector("#summary");
  const editor = document.querySelector("#editor");
  const notice = document.querySelector("#notice");
  let products = [];
  let edit = () => { notice.textContent = "请按本课正文连接编辑表单"; };
  function render() {
    const visible = selectProducts(products, { query: search.value });
    list.replaceChildren(...visible.map((product) => {
      const row = document.createElement("article");
      row.dataset.id = product.id;
      const title = document.createElement("h2");
      title.textContent = `${product.id} ${product.name}`;
      const details = document.createElement("p");
      details.textContent = `${product.category} · 库存 ${product.stock} 件 · 单价 ${product.priceCents} 分 · 标签 ${product.tags.join("、") || "无"}`;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.id = product.id;
      button.textContent = `编辑 ${product.id}`;
      row.append(title, details, button);
      return row;
    }));
    const totals = summarize(products);
    summary.textContent = `全部 ${totals.count} 种 · 总库存 ${totals.stock} · 总价值 ${totals.valueCents} 分 · 当前显示 ${visible.length} 种`;
  }
  async function refresh() { products = await repository.list(); render(); }
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (button) edit(structuredClone(products.find((product) => product.id === button.dataset.id)), button);
  });
  search.addEventListener("input", render);
  await refresh();
  return {
    repository, editor, refresh,
    onEdit(callback) { edit = callback; notice.textContent = "选择一件商品编辑库存"; },
    close(opener) {
      editor.hidden = true;
      const next = [...list.querySelectorAll("button[data-id]")].find((button) => button.dataset.id === opener?.dataset.id);
      (next ?? document.querySelector("h1")).focus();
    },
  };
}
