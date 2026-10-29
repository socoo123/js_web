import React from "react";
import products from "../../data/products.json" with { type: "json" };
import ProductList from "./ProductList.jsx";
import Toolbar from "./Toolbar.jsx";
export default function App() {
  return <main><h1>React 库存工作台</h1>
    <Toolbar count={products.length}><p>同一固定数据，组件只负责显示。</p></Toolbar>
    <ProductList products={products} />
  </main>;
}
