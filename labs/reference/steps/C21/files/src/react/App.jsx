import React from "react";
import products from "../../data/products.json" with { type: "json" };
import { ProductCard } from "./ProductCard.jsx";
export default function App() {
  return <main><h1>React 库存工作台</h1>
    <section id="list" aria-label="商品列表">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </section>
  </main>;
}
