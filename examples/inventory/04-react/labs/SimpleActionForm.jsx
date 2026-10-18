import { useState } from "react";

export default function SimpleActionForm() {
  const [receipt, setReceipt] = useState("");
  async function save(formData) {
    const id = formData.get("productId");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReceipt(`收到 ${id}`);
  }
  return <form action={save}>
    <label>商品编号 <input name="productId" defaultValue="P001" /></label>
    <button type="submit">提交编号</button>
    <p role="status">{receipt}</p>
  </form>;
}
