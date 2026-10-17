import { useState } from "react";

export default function UncontrolledForm() {
  const [result, setResult] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setResult(`${data.get("name")} / ${typeof data.get("stock")} / ${data.has("featured")}`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>商品名称<input name="name" defaultValue="机械键盘" /></label>
      <label>库存数量<input name="stock" type="number" defaultValue="12" /></label>
      <label className="checkbox-label"><input name="featured" type="checkbox" defaultChecked />热销标签</label>
      <button type="submit">读取表单</button>
      <p role="status">{result}</p>
    </form>
  );
}
