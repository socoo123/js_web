import { useState } from "react";

export default function EditableRow({ product, onDelete }) {
  const [draft, setDraft] = useState(product.name);
  return (
    <article className="product-card">
      <p>商品：{product.id} · {product.name}</p>
      <label>草稿 {product.id}
        <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <button type="button" onClick={() => onDelete(product.id)}>删除 {product.id}</button>
    </article>
  );
}
