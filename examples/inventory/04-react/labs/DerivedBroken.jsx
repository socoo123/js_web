// 有问题的写法：筛选结果只初始化一次，补货时没有跟着更新。
import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { restockProduct } from "../src/product-state.js";

export default function DerivedBroken() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  const [visibleProducts] = useState(() => products.filter((product) => product.name.includes("鼠标")));
  return <section>
    <p>原始库存：{products.find((product) => product.id === "P002").stock} 件</p>
    <p role="status">筛选库存：{visibleProducts[0].stock} 件</p>
    <button type="button" onClick={() => setProducts((pending) => restockProduct(pending, "P002"))}>给鼠标补 1 件</button>
  </section>;
}
