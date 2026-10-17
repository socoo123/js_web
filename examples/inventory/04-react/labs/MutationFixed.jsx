import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { restockProduct } from "../src/product-state.js";

export default function MutationFixed() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  function handleRestock() {
    setProducts((pending) => restockProduct(pending, "P001"));
  }
  return <section><p role="status">库存：{products[0].stock} 件</p>
    <button type="button" onClick={handleRestock}>给键盘补 1 件</button></section>;
}
