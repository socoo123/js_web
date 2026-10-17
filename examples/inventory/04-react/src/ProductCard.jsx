import { useState } from "react";
import ProductForm from "./ProductForm.jsx";
import { formatPriceCents } from "./product-form.js";

export default function ProductCard({ product, onRestock, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const priceLabel = formatPriceCents(product.priceCents);
  const headingId = `product-${product.id}`;
  const editButtonId = `open-editor-${product.id}`;
  function handleSave(id, changes) {
    onSave(id, changes);
    setEditing(false);
  }
  function handleCancel() {
    setEditing(false);
    document.getElementById(editButtonId)?.focus();
  }
  return (
    <article className="product-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="status">{product.stock === 0 ? "已售罄" : "有货"}</p>
      <p className="price">单价：¥{priceLabel}</p>
      {product.tags.length > 0 && <p>标签：{product.tags.join("、")}</p>}
      <div className="product-actions">
        {onSave && <button id={editButtonId} type="button" aria-expanded={editing} onClick={() => setEditing(true)}>编辑</button>}
        {!editing && onRestock && <button type="button" disabled={product.stock >= 99999} onClick={() => onRestock(product.id)}>补 1 件</button>}
        {!editing && onDelete && <button type="button" onClick={() => onDelete(product.id)}>删除</button>}
      </div>
      {editing && <ProductForm product={product} onSave={handleSave} onCancel={handleCancel} />}
    </article>
  );
}
