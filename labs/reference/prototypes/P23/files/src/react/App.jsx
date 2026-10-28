// region app
import React from "react";
import products from "../../data/products.json" with { type: "json" };
import StockActions from "./StockActions.jsx";
import { ProductCard } from "./ProductCard.jsx";
export default function App() {
  return <main><h1>React 库存工作台</h1>{products.map((product) => <ProductCard key={product.id} product={product}>{product.id === "P001" && <StockActions product={product} />}</ProductCard>)}</main>;
}
// endregion app
