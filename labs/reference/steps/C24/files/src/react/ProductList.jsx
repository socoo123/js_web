// region list
import React, { useState } from "react";
import { ProductCard } from "./ProductCard.jsx";
export default function ProductList({ products, renderActions }) {
  return <section id="list" aria-label="商品列表">
    {products.length === 0 && <p role="status">没有匹配的商品。</p>}
    {products.map((product) => <ProductRow key={product.id} product={product} renderActions={renderActions} />)}
  </section>;
}
// endregion list
// region row
function ProductRow({ product, renderActions }) {
  const [note, setNote] = useState("");
  return <ProductCard product={product}>
    <label>{product.id} 行备注 <input value={note} onChange={(event) => setNote(event.target.value)} /></label>
    {renderActions?.(product)}
  </ProductCard>;
}
// endregion row
