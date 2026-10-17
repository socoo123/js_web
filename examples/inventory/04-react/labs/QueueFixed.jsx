import { useState } from "react";
import { products } from "../../../shared/products.js";

export default function QueueFixed() {
  const [stock, setStock] = useState(products[0].stock);
  function handleThree() {
    setStock((pending) => pending + 1);
    setStock((pending) => pending + 1);
    setStock((pending) => pending + 1);
  }
  return (
    <section aria-label="连续补货">
      <h2>机械键盘</h2>
      <p role="status">库存：{stock} 件</p>
      <button type="button" onClick={handleThree}>补 3 件</button>
    </section>
  );
}
