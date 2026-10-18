import { useContext, useEffect, useRef, useState } from "react";
import { InventoryProvider, ProductsContext, ProductsDispatchContext } from "./InventoryContext.jsx";
import InventorySummary from "./InventorySummary.jsx";
import InventoryCatalog from "./InventoryCatalog.jsx";
import InventoryCounter from "./InventoryCounter.jsx";
import ProductForm from "./ProductForm.jsx";
import InventoryNote from "./InventoryNote.jsx";
import ReportPanel from "./ReportPanel.jsx";
import { Route, Routes, Navigate } from "react-router";
import InventoryLayout from "./InventoryLayout.jsx";
import ProductDetailRoute from "./ProductDetailRoute.jsx";
import NotFound from "./NotFound.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { createInventoryQueryClient } from "./query-client.js";
import { mockProductService } from "./mock-product-service.js";

export default function App({ loadProduct = mockProductService.getProduct, saveProduct = mockProductService.restock }) {
  const [client] = useState(createInventoryQueryClient);
  return <QueryClientProvider client={client}><InventoryProvider><Routes>
    <Route element={<InventoryLayout />}>
      <Route index element={<Navigate to="/products" replace />} />
      <Route path="products">
        <Route index element={<InventoryPage />} />
        <Route path=":productId" element={<ProductDetailRoute loadProduct={loadProduct} saveProduct={saveProduct} />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></InventoryProvider></QueryClientProvider>;
}

function InventoryPage() {
  const products = useContext(ProductsContext);
  const dispatch = useContext(ProductsDispatchContext);
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  if (products === null || dispatch === null) throw new Error("InventoryPage 需要 InventoryProvider");
  const editingProduct = products.find((product) => product.id === editingId) ?? null;

  function handleDelete(id) {
    dispatch({ type: "removed", id });
    if (editingId === id) {
      setEditingId(null);
      setNotice(`已删除 ${id}，编辑已结束。`);
      headingRef.current?.focus();
    }
  }
  function handleSave(id, changes) {
    dispatch({ type: "saved", id, changes });
    setEditingId(null);
    setNotice(`已保存 ${id}。如未见卡片，请检查筛选条件。`);
    headingRef.current?.focus();
  }
  function handleCancel() {
    setEditingId(null);
    const target = document.getElementById(`open-editor-${editingId}`)
      ?? headingRef.current;
    target?.focus();
  }

  return (
    <>
      <h1 id="inventory-heading" ref={headingRef} tabIndex={-1}>库存管理</h1>
      <p role="status">{notice}</p>
      <InventorySummary />
      <ReportPanel />
      <InventoryCatalog editingId={editingId} onEdit={setEditingId} onDelete={handleDelete}>
        <InventoryCounter />
        <InventoryNote />
        <section id="product-editor" aria-labelledby="editor-heading">
          <h2 id="editor-heading">商品编辑区</h2>
          <p>切换商品、取消或删除当前商品会丢弃未保存草稿；筛选和排序保留草稿。</p>
          {editingProduct
            ? <ProductForm key={editingProduct.id} product={editingProduct} onSave={handleSave} onCancel={handleCancel} />
            : <p>点击商品的编辑按钮开始。</p>}
        </section>
      </InventoryCatalog>
    </>
  );
}
