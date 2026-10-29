// region setup
import React from "react";
export default function StockActions({ product, onRestock }) {
// endregion setup
  // region queue
  function restockThree() {
    onRestock(product.id, 1);
    onRestock(product.id, 1);
    onRestock(product.id, 1);
  }
  // endregion queue
  // region delay
  function restockLater() {
    setTimeout(() => onRestock(product.id, 3), 3000);
  }
  // endregion delay
  // region controls
  return <section aria-label={`${product.id} 补货操作`}>
    <p role="status">{product.id} 当前库存 {product.stock} 件</p>
    <button type="button" disabled={product.stock > 99996} onClick={restockThree}>连续补三件</button>
    <button type="button" disabled={product.stock >= 99999} onClick={() => onRestock(product.id, 1)}>立即补一件</button>
    <button type="button" disabled={product.stock > 99996} onClick={restockLater}>延迟补三件</button>
  </section>;
}
// endregion controls
