// 有问题的写法：把空白先转成 0，只校验转换后的数字。
import { useState } from "react";

export default function BlankStockBroken() {
  const [stock, setStock] = useState("");
  const [message, setMessage] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    const value = Number(stock);
    if (!Number.isInteger(value) || value < 0 || value > 99999) {
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
