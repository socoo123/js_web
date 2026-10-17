// 有问题的写法：延时补货用旧快照算出替换值，覆盖期间的新操作。
import { useState } from "react";
import { products } from "../../../shared/products.js";

export default function DelayBroken() {
  const [stock, setStock] = useState(products[0].stock);
  function handleLater() {
    setTimeout(() => setStock(stock + 3), 2000);
  }
  return (
    <section aria-label="延时补货">
      <h2>机械键盘</h2>
      <p role="status">库存：{stock} 件</p>
      <button type="button" onClick={handleLater}>2 秒后补 3 件</button>{" "}
      <button type="button" onClick={() => setStock((n) => n + 1)}>立即补 1 件</button>
    </section>
  );
}
