import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { products } from "../../../shared/products.js";
import InventoryToolbar from "../src/InventoryToolbar.jsx";
import ProductList from "../src/ProductList.jsx";
import ProductListBroken from "./ProductListBroken.jsx";
import TagsBroken from "./TagsBroken.jsx";
import "../src/styles.css";

const choice = new URLSearchParams(location.search).get("case");
function PropsPreview() {
  if (choice === "wrong") return <ProductListBroken products={products} />;
  if (choice === "zero") return <TagsBroken product={products[1]} />;
  if (choice === "empty") return <ProductList products={[]} emptyMessage="配件分类暂时没有商品。" />;
  return (
    <>
      <InventoryToolbar count={0}><a href="#notes">查看盘点说明</a></InventoryToolbar>
      <p id="notes">数量与内容分别由 count 和 children 提供。</p>
      <ProductList products={products.slice(0, 2)} />
    </>
  );
}
createRoot(document.getElementById("root")).render(<StrictMode><h1>Props 与组合实验</h1><PropsPreview /></StrictMode>);
