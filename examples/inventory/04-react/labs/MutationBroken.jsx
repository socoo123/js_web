// 有问题的写法：直接修改 state，再提交同一个数组。
import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";

export default function MutationBroken() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  function handleRestock() {
    products[0].stock += 1;
    setProducts(products);
  }
  return <section><p role="status">库存：{products[0].stock} 件</p>
    <button type="button" onClick={handleRestock}>给键盘补 1 件</button></section>;
}
