import React from "react";
import { ProductCard } from "./ProductCard.jsx";
export default function ProductList({ products, renderActions }) {
  return <section id="list" aria-label="商品列表">
    {products.length === 0 && <p role="status">没有匹配的商品。</p>}
    {products.map((product) => <ProductCard key={product.id} product={product}>
      {renderActions?.(product)}
    </ProductCard>)}
  </section>;
}
