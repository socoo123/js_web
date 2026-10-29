// region report-imports
import { HashRouter, Routes, Route, Link, useParams, useSearchParams } from "react-router";
import React, { useState, useRef, Profiler, lazy, Suspense } from "react";
import ReportErrorBoundary from "./ReportErrorBoundary.jsx";
const ReportPanel = lazy(() => import("./ReportPanel.jsx"));
function recordRender(id, phase, actualDuration, baseDuration) {
  console.info("库存渲染", JSON.stringify({ id, phase, actualDuration, baseDuration }));
}
// endregion report-imports
import { InventoryProvider, useInventory } from "./InventoryProvider.jsx";
import { selectProducts, sortByStock, summarize, nextProductId } from "../core/inventory.js";
import ProductList from "./ProductList.jsx";
import Toolbar from "./Toolbar.jsx";
import StockActions from "./StockActions.jsx";
import { useInventoryShortcuts } from "./useInventoryShortcuts.js";
import ProductDetail from "./ProductDetail.jsx";
import ProductEditor from "./ProductEditor.jsx";
// region profiler
export default function App({ inventoryRepository }) {
  return <InventoryProvider repository={inventoryRepository}><HashRouter>
    <Profiler id="inventory-view" onRender={recordRender}><InventoryView /></Profiler>
  </HashRouter></InventoryProvider>;
}
// endregion profiler
function InventoryView() {
  const { products, dispatch, snapshot } = useInventory();
  const trigger = useRef(null);
  const heading = useRef(null);
  function openEditor(id, button) { trigger.current = button; setSelectedId(id); }
  function closeEditor(target = trigger.current) {
    setSelectedId(null);
    (target?.isConnected ? target : heading.current)?.focus();
  }
  const [operationMessage, setOperationMessage] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId === "new"
    ? { id: nextProductId(products), name: "", category: "配件", stock: 0, priceCents: 0, tags: [] }
    : products.find((product) => product.id === selectedId);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const rawCategory = searchParams.get("category");
  const category = ["外设", "显示器", "配件", "音频"].includes(rawCategory) ? rawCategory : "全部";
  const order = searchParams.get("order") === "stock" ? "stock" : "id";
  function changeFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === "全部" || (key === "order" && value === "id")) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: key === "q" });
  }
// region derived
  const filtered = selectProducts(products, { query, category });
  const visible = order === "stock" ? sortByStock(filtered) : filtered;
  const summary = summarize(visible);
// endregion derived
  useInventoryShortcuts(products.length, restock);
  const [failSave, setFailSave] = useState(false);
  async function saveProduct(value) {
    const staysVisible = selectedId === "new"
      || selectProducts([value], { query, category }).length > 0;
    const target = staysVisible ? trigger.current : heading.current;
    await dispatch({ type: selectedId === "new" ? "created" : "saved", product: value,
      options: { fail: failSave, delay: 300 } });
    setOperationMessage(""); closeEditor(target);
  }
  async function restock(id, amount) {
    try { await dispatch({ type: "restocked", id, amount }); setOperationMessage(""); }
    catch (error) { setOperationMessage(error.message); }
  }
  async function removeProduct(id) {
    try { await dispatch({ type: "deleted", id }); setOperationMessage(""); }
    catch (error) { setOperationMessage(error.message); }
  }
// region report-state
  const [showReport, setShowReport] = useState(false);
  const [failReport, setFailReport] = useState(false);
// endregion report-state
// region report-view
  const report = <>
    <button aria-expanded={showReport} aria-controls="inventory-report" onClick={() => setShowReport((open) => !open)}>{showReport ? "收起分类报表" : "查看分类报表"}</button>
    <label><input type="checkbox" checked={failReport} onChange={(event) => setFailReport(event.target.checked)} />模拟报表故障</label>
    <div id="inventory-report">{showReport && <ReportErrorBoundary>
      <Suspense fallback={<p role="status">正在加载报表代码…</p>}>
        <ReportPanel products={products} fail={failReport} />
      </Suspense>
    </ReportErrorBoundary>}</div>
  </>;
// endregion report-view
  return <main><h1 ref={heading} tabIndex={-1}>React 库存工作台</h1>
    <Toolbar count={visible.length}>
      <label>搜索 <input placeholder="名称或编号" value={query} onChange={(event) => changeFilter("q", event.target.value)} /></label>
      <label>分类 <select aria-label="分类" value={category} onChange={(event) => changeFilter("category", event.target.value)}>
        {["全部", "外设", "显示器", "配件", "音频"].map((name) => <option key={name}>{name}</option>)}
      </select></label>
      <label>排序 <select aria-label="排序" value={order} onChange={(event) => changeFilter("order", event.target.value)}><option value="id">编号</option><option value="stock">库存升序</option></select></label>
      <button onClick={(event) => openEditor("new", event.currentTarget)} disabled={nextProductId(products) === null}>新建商品</button>
    </Toolbar>
    <p id="summary">库存 {summary.stock} / 价值 {summary.valueCents} 分</p>
    <p role="alert">{operationMessage}</p>
    <ProductList products={visible} renderActions={(product) => <>
      <StockActions product={product} onRestock={restock} />
      <Link to={{ pathname: `/products/${product.id}`, search: `?${searchParams}` }}>详情 {product.id}</Link>
      <button onClick={(event) => openEditor(product.id, event.currentTarget)}>编辑 {product.id}</button>
      <button onClick={() => removeProduct(product.id)}>删除 {product.id}</button>
    </>} />
    {report}
    <Link to={{ pathname: "/", search: `?${searchParams}` }}>返回列表</Link>
    <Routes>
      <Route path="/" element={<p>选择商品查看详情</p>} />
      <Route path="/products/:id" element={<DetailRoute />} />
      <Route path="*" element={<p>未找到页面</p>} />
    </Routes>
    <section aria-label="本地库存快照">
      <button onClick={snapshot.save}>保存本地快照</button><button onClick={snapshot.recover}>恢复备份</button>
      <button onClick={async () => {
        try { download(await snapshot.exportText()); }
        catch (error) { snapshot.report(`导出失败：${error.message}`); }
      }}>导出快照</button>
      <label>导入快照 <input type="file" accept="application/json" onChange={async (event) => {
        const input = event.currentTarget; const file = input.files[0];
        try { if (file) await snapshot.importText(await file.text()); }
        catch (error) { snapshot.report(`文件读取失败：${error.message}`); }
        finally { input.value = ""; }
      }} /></label>
      <p role="status">{snapshot.message}</p>
    </section>
    <label><input type="checkbox" checked={failSave} onChange={(event) => setFailSave(event.target.checked)} />模拟保存失败</label>
    {selected && <ProductEditor key={selectedId} product={selected} onSave={saveProduct} onCancel={() => closeEditor()} />}
  </main>;
}
function DetailRoute() {
  const { id } = useParams();
  return <ProductDetail productId={id} />;
}
function download(text) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "inventory.json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
