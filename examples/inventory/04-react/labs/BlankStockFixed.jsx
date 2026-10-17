import { useState } from "react";
import { parseStock } from "../src/product-form.js";

export default function BlankStockFixed() {
  const [stock, setStock] = useState("");
  const [message, setMessage] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    const value = parseStock(stock);
    if (value === null) {
      setMessage("库存无效");
      return;
    }
    setMessage(`已保存库存 ${value}`);
  }
  return (
    <form noValidate onSubmit={handleSubmit}>
      <label>库存数量<input required type="number" value={stock} onChange={(event) => setStock(event.target.value)} /></label>
      <button type="submit">保存库存</button>
      <p role="status">{message}</p>
    </form>
  );
}
