import { useContext, useState } from "react";
import { ProductsContext, ProductsDispatchContext } from "./InventoryContext.jsx";
import { nextProductId, selectProducts } from "./product-state.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";

export default function InventoryCatalog({ editingId, onEdit, onDelete, children }) {
  const products = useContext(ProductsContext);
  const dispatch = useContext(ProductsDispatchContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [order, setOrder] = useState("id");
  if (products === null || dispatch === null) throw new Error("InventoryCatalog 需要 InventoryProvider");
  const visibleProducts = selectProducts(products, { query, category, order });
  return (
    <>
      <InventoryToolbar count={visibleProducts.length}>
        <label>搜索名称 <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>分类 <select aria-label="分类" value={category} onChange={(event) => setCategory(event.target.value)}>
          {["全部", "外设", "显示器", "配件", "音频"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label>排序 <select aria-label="排序" value={order} onChange={(event) => setOrder(event.target.value)}>
          <option value="id">编号</option><option value="stock">库存升序</option><option value="price">价格升序</option>
        </select></label>
        <button type="button" onClick={() => dispatch({ type: "sampleAdded" })}
          disabled={nextProductId(products) === null}>新增示例商品</button>
      </InventoryToolbar>
      {children}
      <ProductList products={visibleProducts} editingId={editingId} onEdit={onEdit} onDelete={onDelete}
        onRestock={(id) => dispatch({ type: "restocked", id })} />
    </>
  );
}
