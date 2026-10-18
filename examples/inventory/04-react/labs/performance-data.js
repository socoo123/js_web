import { products } from "../../../shared/products.js";

// 重复展示固定六件商品以放大渲染成本，不创建业务商品或写入库存。
export const sampleRows = Array.from({ length: 1200 }, (_, index) => ({
  rowKey: `sample-${index}`, product: products[index % products.length],
}));

export function filterRows(query) {
  return sampleRows.filter(({ product }) => product.name.includes(query));
}

export function demonstrationCost(stock) {
  let score = 0;
  for (let index = 0; index < 12000; index++) score += Math.sqrt(index + stock);
  return Math.round(score);
}
