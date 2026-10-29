// region setup
import React, { useRef, useState, useEffect } from "react";
export default function StockActions({ product, onRestock }) {
  const timer = useRef(null);
  const [waiting, setWaiting] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
// endregion setup
  // region queue
  function restockThree() {
    onRestock(product.id, 1);
    onRestock(product.id, 1);
    onRestock(product.id, 1);
  }
  // endregion queue
  // region delay
  function cancelLater() {
    clearTimeout(timer.current);
    timer.current = null; setWaiting(false);
  }
  function restockLater() {
    cancelLater(); setWaiting(true);
    timer.current = setTimeout(() => {
      timer.current = null; setWaiting(false); onRestock(product.id, 3);
    }, 2000);
  }
  // endregion delay
  // region controls
  return <section aria-label={`${product.id} 补货操作`}>
    <p role="status">{product.id} 当前库存 {product.stock} 件</p>
    <button type="button" disabled={product.stock > 99996} onClick={restockThree}>连续补三件</button>
    <button type="button" disabled={product.stock >= 99999} onClick={() => onRestock(product.id, 1)}>立即补一件</button>
    <button type="button" disabled={product.stock > 99996} onClick={restockLater}>延迟补三件</button>
    <button type="button" onClick={cancelLater} disabled={!waiting}>取消盘点</button>
    {waiting && <p>盘点等待中</p>}
  </section>;
}
// endregion controls
