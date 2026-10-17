import { products } from "../shared/products.js";

function summary({ count = 6, children = "待盘点" }) {
  return `${count} 种 / ${children}`;
}

console.log(summary({ count: 0 }));
console.log(summary({ count: undefined, children: "已盘点" }));
console.log(summary({ count: null, children: "" }));
console.log(products[1].stock && "已售罄");
