import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";
import InventoryCounter from "./InventoryCounter.jsx";
import ProductForm from "./ProductForm.jsx";
import { addSampleProduct, nextProductId, removeProduct, restockProduct, selectProducts, updateProduct } from "./product-state.js";

export default function App() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [order, setOrder] = useState("id");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const editingProduct = products.find((product) => product.id === editingId) ?? null;
  const visibleProducts = selectProducts(products, { query, category, order });
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalCents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);

  function handleRestock(id) {
    setProducts((pending) => restockProduct(pending, id));
  }
  function handleDelete(id) {
    setProducts((pending) => removeProduct(pending, id));
    if (editingId === id) {
      setEditingId(null);
      setNotice(`已删除 ${id}，编辑已结束。`);
      document.getElementById("inventory-heading")?.focus();
    }
  }
  function handleAdd() {
    setProducts((pending) => addSampleProduct(pending));
  }
  function handleSave(id, changes) {
    setProducts((pending) => updateProduct(pending, id, changes));
    setEditingId(null);
    setNotice(`已保存 ${id}。如未见卡片，请检查筛选条件。`);
    document.getElementById("inventory-heading")?.focus();
  }
  function handleCancel() {
    setEditingId(null);
    const target = document.getElementById(`open-editor-${editingId}`)
      ?? document.getElementById("inventory-heading");
    target?.focus();
  }

  return (
    <>
      <h1 id="inventory-heading" tabIndex={-1}>库存管理</h1>
      <p role="status">{notice}</p>
      <p>全部：{products.length} 种 · 总库存 {totalStock} 件 · 库存总价值 ¥{(totalCents / 100).toFixed(2)}</p>
      <InventoryToolbar count={visibleProducts.length}>
        <label>搜索名称 <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>分类 <select aria-label="分类" value={category} onChange={(event) => setCategory(event.target.value)}>
          {["全部", "外设", "显示器", "配件", "音频"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label>排序 <select aria-label="排序" value={order} onChange={(event) => setOrder(event.target.value)}>
          <option value="id">编号</option><option value="stock">库存升序</option><option value="price">价格升序</option>
        </select></label>
        <button type="button" onClick={handleAdd} disabled={nextProductId(products) === null}>新增示例商品</button>
      </InventoryToolbar>
      <InventoryCounter />
      <section id="product-editor" aria-labelledby="editor-heading">
        <h2 id="editor-heading">商品编辑区</h2>
        <p>切换商品、取消或删除当前商品会丢弃未保存草稿；筛选和排序保留草稿。</p>
        {editingProduct
          ? <ProductForm key={editingProduct.id} product={editingProduct} onSave={handleSave} onCancel={handleCancel} />
          : <p>点击商品的编辑按钮开始。</p>}
      </section>
      <ProductList products={visibleProducts} editingId={editingId} onEdit={setEditingId} onRestock={handleRestock} onDelete={handleDelete} />
    </>
  );
}
