// region setup
import React, { useState } from "react";
import { updateStock } from "../core/inventory.js";
export default function StockActions({ product }) {
  const [stock, setStock] = useState(product.stock);
  function add(previous, amount) {
    if (previous + amount > 99999) return previous;
    return updateStock([product], product.id, previous + amount)[0].stock;
  }
// endregion setup
  // region queue
  function restockThree() {
    setStock((previous) => add(previous, 1));
    setStock((previous) => add(previous, 1));
    setStock((previous) => add(previous, 1));
  }
  // endregion queue
  // region delay
  function restockLater() {
    setTimeout(() => {
      setStock((previous) => add(previous, 3));
    }, 3000);
  }
  // endregion delay
  // region controls
  return <section aria-label="P001 补货操作">
    <p role="status">P001 当前库存 {stock} 件</p>
    <button type="button" onClick={restockThree}>连续补三件</button>
    <button type="button" onClick={() => setStock((previous) => add(previous, 1))}>立即补一件</button>
    <button type="button" onClick={restockLater}>延迟补三件</button>
  </section>;
}
// endregion controls
