import { products } from "../../../shared/products.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";

export default function App() {
  return (
    <>
      <h1>库存管理</h1>
      <InventoryToolbar count={products.length}>
        <span>本次盘点：全部分类</span>
      </InventoryToolbar>
      <ProductList products={products} />
    </>
  );
}
