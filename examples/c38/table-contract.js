import { products } from "../shared/products.js";
const visible = products.toSorted((a, b) => a.stock - b.stock);
const firstRecord = visible[0];
console.log("编辑回调", firstRecord.id);
console.log("单元格值", firstRecord.stock, typeof firstRecord.stock);
console.log("价格显示", (firstRecord.priceCents / 100).toFixed(2));
console.log("排序依据", firstRecord.priceCents, typeof firstRecord.priceCents);
