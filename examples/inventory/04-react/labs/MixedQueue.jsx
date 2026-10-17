import { useState } from "react";
import { products } from "../../../shared/products.js";

export default function MixedQueue() {
  const [stock, setStock] = useState(products[0].stock);
  function replaceThenAdd() {
    setStock(stock + 3);
    setStock((pending) => pending + 1);
  }
  function addThenReplace() {
    setStock((pending) => pending + 1);
    setStock(stock + 3);
  }
  return (
    <section aria-label="混合更新">
      <p role="status">库存：{stock} 件</p>
      <button type="button" onClick={replaceThenAdd}>先替换再累加</button>{" "}
      <button type="button" onClick={addThenReplace}>先累加再替换</button>
    </section>
  );
}
