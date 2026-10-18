import { products } from "../shared/products.js";
import { summarizeCategories } from "../inventory/04-react/src/report-summary.js";
const groups = summarizeCategories(products);
for (const group of groups) {
  console.log(group.category, group.count, group.stock, group.valueCents);
}
console.log("总库存", groups.reduce((sum, group) => sum + group.stock, 0));
console.log("总价值（分）", groups.reduce((sum, group) => sum + group.valueCents, 0));
