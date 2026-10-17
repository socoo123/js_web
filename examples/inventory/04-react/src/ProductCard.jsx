import { formatPriceCents } from "./product-form.js";

export default function ProductCard({ product, editing = false, onEdit, onRestock, onDelete }) {
  const priceLabel = formatPriceCents(product.priceCents);
  const headingId = `product-${product.id}`;
  const editButtonId = `open-editor-${product.id}`;
  return (
    <article className="product-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="status">{product.stock === 0 ? "已售罄" : "有货"}</p>
      <p className="price">单价：¥{priceLabel}</p>
      {product.tags.length > 0 && <p>标签：{product.tags.join("、")}</p>}
      <div className="product-actions">
        {onEdit && <button id={editButtonId} type="button" aria-expanded={editing} aria-controls="product-editor" onClick={() => onEdit(product.id)}>编辑</button>}
        {onRestock && <button type="button" disabled={editing || product.stock >= 99999} onClick={() => onRestock(product.id)}>补 1 件</button>}
        {onDelete && <button type="button" onClick={() => onDelete(product.id)}>删除</button>}
      </div>
    </article>
  );
}
