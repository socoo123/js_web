// region state
import React, { useState } from "react";
import seed from "../../data/products.json" with { type: "json" };
import { selectProducts, sortByStock, summarize, updateStock, nextProductId } from "../core/inventory.js";
import ProductList from "./ProductList.jsx";
import Toolbar from "./Toolbar.jsx";
import StockActions from "./StockActions.jsx";
export default function App() {
  const [products, setProducts] = useState(() => structuredClone(seed));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [order, setOrder] = useState("id");
  const filtered = selectProducts(products, { query, category });
  const visible = order === "stock" ? sortByStock(filtered) : filtered;
  const summary = summarize(visible);
// endregion state
// region mutations
  function restock(id, amount) {
    setProducts((previous) => {
      const product = previous.find((item) => item.id === id);
      if (!product || product.stock + amount > 99999) return previous;
      return updateStock(previous, id, product.stock + amount);
    });
  }
  function addSample() {
    setProducts((previous) => {
      const id = nextProductId(previous);
      return id ? [...previous, { id, name: "新商品", category: "配件", stock: 0, priceCents: 0, tags: [] }] : previous;
    });
  }
// endregion mutations
// region view
  return <main><h1>React 库存工作台</h1>
    <Toolbar count={visible.length}>
      <label>搜索 <input placeholder="名称或编号" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>分类 <select aria-label="分类" value={category} onChange={(event) => setCategory(event.target.value)}>
        {["全部", "外设", "显示器", "配件", "音频"].map((name) => <option key={name}>{name}</option>)}
      </select></label>
      <label>排序 <select aria-label="排序" value={order} onChange={(event) => setOrder(event.target.value)}><option value="id">编号</option><option value="stock">库存升序</option></select></label>
      <button onClick={addSample} disabled={nextProductId(products) === null}>新增示例商品</button>
    </Toolbar>
    <p id="summary">库存 {summary.stock} / 价值 {summary.valueCents} 分</p>
    <ProductList products={visible} renderActions={(product) => <>
      <StockActions product={product} onRestock={restock} />
      <button onClick={() => setProducts((previous) => previous.filter((item) => item.id !== product.id))}>删除 {product.id}</button>
    </>} />
  </main>;
}
// endregion view
