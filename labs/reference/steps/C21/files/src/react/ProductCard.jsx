import React from "react";
import { formatPriceCents } from "../core/inventory.js";
export function ProductCard({ product, children }) {
  return <article data-id={product.id}>
    <h2>{product.id} {product.name}</h2>
    <p>库存 {product.stock} 件</p>
    <p>单价 {formatPriceCents(product.priceCents)} 元</p>
    {children}
  </article>;
}
