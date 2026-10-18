import { useState } from "react";
import { freshProducts } from "../src/inventory-storage.js";
import { restockProduct } from "../src/product-state.js";

export default function ReviewSummaryCase({ Summary }) {
  const [products, setProducts] = useState(freshProducts);
  return <section aria-label="统计复盘">
    <p>鼠标库存 {products.find((product) => product.id === "P002").stock} 件</p>
    <button onClick={() => setProducts((pending) => restockProduct(pending, "P002"))}>给鼠标补 1 件</button>
    <Summary products={products} />
  </section>;
}
