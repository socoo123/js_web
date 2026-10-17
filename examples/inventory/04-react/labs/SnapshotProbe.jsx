import { useState } from "react";
import { products } from "../../../shared/products.js";

export default function SnapshotProbe() {
  const [stock, setStock] = useState(products[0].stock);
  function handleSnapshot() {
    console.log("点击时", stock);
    setStock(stock + 3);
    console.log("调用 setter 后", stock);
    setTimeout(() => console.log("两秒后", stock), 2000);
  }
  return (
    <section aria-label="状态快照">
      <h2>机械键盘</h2>
      <p role="status">库存：{stock} 件</p>
      <button type="button" onClick={handleSnapshot}>补 3 件并观察日志</button>{" "}
      <button type="button" onClick={() => setStock((n) => n + 1)}>补 1 件</button>
    </section>
  );
}
