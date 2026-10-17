import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";
import InventoryCounter from "./InventoryCounter.jsx";
import { addSampleProduct, nextProductId, removeProduct, restockProduct, selectProducts } from "./product-state.js";

export default function App() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [order, setOrder] = useState("id");
  const visibleProducts = selectProducts(products, { query, category, order });
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalCents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);

  function handleRestock(id) {
    setProducts((pending) => restockProduct(pending, id));
  }
  function handleDelete(id) {
    setProducts((pending) => removeProduct(pending, id));
  }
  function handleAdd() {
    setProducts((pending) => addSampleProduct(pending));
  }

  return (
    <>
      <h1>库存管理</h1>
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
      <ProductList products={visibleProducts} onRestock={handleRestock} onDelete={handleDelete} />
    </>
  );
}
