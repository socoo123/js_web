// 有问题的写法：三次计算都读取同一份 stock 快照。
import { useState } from "react";
import { products } from "../../../shared/products.js";

export default function QueueBroken() {
  const [stock, setStock] = useState(products[0].stock);
  function handleThree() {
    setStock(stock + 1);
    setStock(stock + 1);
    setStock(stock + 1);
  }
  return (
    <section aria-label="连续补货">
      <h2>机械键盘</h2>
      <p role="status">库存：{stock} 件</p>
      <button type="button" onClick={handleThree}>补 3 件</button>
    </section>
  );
}
