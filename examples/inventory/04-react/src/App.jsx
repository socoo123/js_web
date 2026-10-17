import { useContext, useRef, useState } from "react";
import { InventoryProvider, ProductsContext, ProductsDispatchContext } from "./InventoryContext.jsx";
import InventorySummary from "./InventorySummary.jsx";
import InventoryCatalog from "./InventoryCatalog.jsx";
import InventoryCounter from "./InventoryCounter.jsx";
import ProductForm from "./ProductForm.jsx";

export default function App() {
  return <InventoryProvider><InventoryPage /></InventoryProvider>;
}

function InventoryPage() {
  const products = useContext(ProductsContext);
  const dispatch = useContext(ProductsDispatchContext);
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const headingRef = useRef(null);
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
      <InventoryCatalog editingId={editingId} onEdit={setEditingId} onDelete={handleDelete}>
        <InventoryCounter />
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
