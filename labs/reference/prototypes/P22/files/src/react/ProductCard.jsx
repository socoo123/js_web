import React from "react";
export function ProductCard({ product, children }) {
  return <article><h2>{product.id} {product.name}</h2><p>库存 {product.stock} 件</p>{children}</article>;
}
