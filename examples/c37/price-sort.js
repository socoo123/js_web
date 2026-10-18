import { products } from "../shared/products.js";

const rows = products.map((product) => ({
  id: product.id,
  priceCents: product.priceCents,
  priceLabel: (product.priceCents / 100).toFixed(2),
}));
const byLabel = rows.toSorted((a, b) => a.priceLabel.localeCompare(b.priceLabel));
const byValue = rows.toSorted((a, b) => a.priceCents - b.priceCents);
console.log("按显示文本", byLabel.map((row) => row.id).join(","));
console.log("按整数分", byValue.map((row) => row.id).join(","));
console.log("原始价格类型", typeof products[0].priceCents);
