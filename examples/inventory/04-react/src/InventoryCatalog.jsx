import { useContext, useRef } from "react";
import { ProductsContext, ProductsDispatchContext } from "./InventoryContext.jsx";
import { nextProductId, selectProducts } from "./product-state.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";
import InventorySearchShortcut from "./InventorySearchShortcut.jsx";
import { useCatalogFilters } from "./useCatalogFilters.js";

export default function InventoryCatalog({ editingId, onEdit, onDelete, children }) {
  const products = useContext(ProductsContext);
  const dispatch = useContext(ProductsDispatchContext);
  const { query, category, order, changeFilter, search } = useCatalogFilters();
  const searchRef = useRef(null);
  if (products === null || dispatch === null) throw new Error("InventoryCatalog 需要 InventoryProvider");
  const visibleProducts = selectProducts(products, { query, category, order });
  return (
    <>
      <InventorySearchShortcut inputRef={searchRef} />
      <InventoryToolbar count={visibleProducts.length}>
        <label>搜索名称（按 / 聚焦） <input ref={searchRef} value={query} onChange={(event) => changeFilter("q", event.target.value)} /></label>
        <label>分类 <select aria-label="分类" value={category} onChange={(event) => changeFilter("category", event.target.value)}>
          {["全部", "外设", "显示器", "配件", "音频"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label>排序 <select aria-label="排序" value={order} onChange={(event) => changeFilter("order", event.target.value)}>
          <option value="id">编号</option><option value="stock">库存升序</option><option value="price">价格升序</option>
        </select></label>
        <button type="button" onClick={() => dispatch({ type: "sampleAdded" })}
          disabled={nextProductId(products) === null}>新增示例商品</button>
      </InventoryToolbar>
      {children}
      <ProductList detailsSearch={search} products={visibleProducts} editingId={editingId} onEdit={onEdit} onDelete={onDelete}
        onRestock={(id) => dispatch({ type: "restocked", id })} />
    </>
  );
}
