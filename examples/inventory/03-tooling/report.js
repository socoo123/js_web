import { Inventory } from "../01-core/inventory.js";
import { validateProducts } from "../02-web/validation.js";

export function createReport(rows, { category = "全部", limit = 5 } = {}) {
  const products = validateProducts(rows);
  const inventory = new Inventory(products.filter(p => category === "全部" || p.category === category));
  const { totalStock, totalValueCents, soldOutCount } = inventory.summary();
  const lowStockCount = inventory.select(p => p.stock > 0 && p.stock <= limit).length;
  const groups = [...inventory.groupedByCategory()].map(([name, items]) => `${name} ${items.length}`);
  return [
    `库存报告（${category}）`,
    `商品种类：${inventory.count()}`,
    `总库存：${totalStock} 件`,
    `库存总价值：${totalValueCents} 分（${(totalValueCents / 100).toFixed(2)} 元）`,
    `售罄：${soldOutCount} 种`,
    `低库存（阈值 ${limit} 件）：${lowStockCount} 种`,
    `分类：${groups.join("、") || "无"}`,
    `标签：${inventory.uniqueTags().join("、") || "无"}`,
  ].join("\n") + "\n";
}
