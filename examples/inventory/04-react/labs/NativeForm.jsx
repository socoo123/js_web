import { useState } from "react";

export default function NativeForm() {
  const [message, setMessage] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    setMessage(`进入提交处理：库存 ${new FormData(event.currentTarget).get("stock")} 件`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>库存数量<input name="stock" type="number" required min="0" max="99999" step="1" /></label>
      <button type="submit">提交库存</button>
      <p role="status">{message}</p>
    </form>
  );
}
