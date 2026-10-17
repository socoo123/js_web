import { products } from "../../../shared/products.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";
import InventoryCounter from "./InventoryCounter.jsx";

export default function App() {
  return (
    <>
      <h1>库存管理</h1>
      <InventoryToolbar count={products.length}>
        <span>本次盘点：全部分类</span>
      </InventoryToolbar>
      <InventoryCounter />
      <ProductList products={products} />
    </>
  );
}
