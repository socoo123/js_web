// region state
import React, { useState, useRef } from "react";
import { InventoryProvider, useInventory } from "./InventoryProvider.jsx";
import { selectProducts, sortByStock, summarize, nextProductId, validateProducts } from "../core/inventory.js";
import ProductList from "./ProductList.jsx";
import Toolbar from "./Toolbar.jsx";
import StockActions from "./StockActions.jsx";
import { useInventoryShortcuts } from "./useInventoryShortcuts.js";
import ProductEditor from "./ProductEditor.jsx";
export default function App() {
  return <InventoryProvider><InventoryView /></InventoryProvider>;
}
function InventoryView() {
  const { products, dispatch } = useInventory();
  const trigger = useRef(null);
  const heading = useRef(null);
  function openEditor(id, button) { trigger.current = button; setSelectedId(id); }
  function closeEditor(target = trigger.current) {
    setSelectedId(null);
    (target?.isConnected ? target : heading.current)?.focus();
  }
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId === "new"
    ? { id: nextProductId(products), name: "", category: "配件", stock: 0, priceCents: 0, tags: [] }
    : products.find((product) => product.id === selectedId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [order, setOrder] = useState("id");
  const filtered = selectProducts(products, { query, category });
  const visible = order === "stock" ? sortByStock(filtered) : filtered;
  const summary = summarize(visible);
  useInventoryShortcuts(products.length, restock);
// endregion state
// region mutations
  function restock(id, amount) { dispatch({ type: "restocked", id, amount }); }
  function saveProduct(value) {
    const next = selectedId === "new" ? [...products, value]
      : products.map((product) => product.id === value.id ? value : product);
    validateProducts(next); summarize(next);
    const staysVisible = selectedId === "new"
      || selectProducts([value], { query, category }).length > 0;
    dispatch({ type: selectedId === "new" ? "created" : "saved", product: value });
    closeEditor(staysVisible ? trigger.current : heading.current);
  }
// endregion mutations
// region view
  return <main><h1 ref={heading} tabIndex={-1}>React 库存工作台</h1>
    <Toolbar count={visible.length}>
      <label>搜索 <input placeholder="名称或编号" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>分类 <select aria-label="分类" value={category} onChange={(event) => setCategory(event.target.value)}>
        {["全部", "外设", "显示器", "配件", "音频"].map((name) => <option key={name}>{name}</option>)}
      </select></label>
      <label>排序 <select aria-label="排序" value={order} onChange={(event) => setOrder(event.target.value)}><option value="id">编号</option><option value="stock">库存升序</option></select></label>
      <button onClick={(event) => openEditor("new", event.currentTarget)} disabled={nextProductId(products) === null}>新建商品</button>
    </Toolbar>
    <p id="summary">库存 {summary.stock} / 价值 {summary.valueCents} 分</p>
    <ProductList products={visible} renderActions={(product) => <>
      <StockActions product={product} onRestock={restock} />
      <button onClick={(event) => openEditor(product.id, event.currentTarget)}>编辑 {product.id}</button>
      <button onClick={() => dispatch({ type: "deleted", id: product.id })}>删除 {product.id}</button>
    </>} />
    {selected && <ProductEditor key={selectedId} product={selected} onSave={saveProduct} onCancel={() => closeEditor()} />}
  </main>;
}
// endregion view
