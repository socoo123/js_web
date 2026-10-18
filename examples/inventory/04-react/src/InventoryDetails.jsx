import { useState } from "react";
import { products } from "../../../shared/products.js";
import ProductDetails from "./ProductDetails.jsx";

export default function InventoryDetails() {
  const [productId, setProductId] = useState(null);
  return <>
    <label htmlFor="detail-product">查看初始商品</label>
    <select id="detail-product" value={productId ?? ""}
      onChange={(event) => setProductId(event.target.value || null)}>
      <option value="">请选择</option>
      {products.map((product) => <option key={product.id} value={product.id}>{product.id} {product.name}</option>)}
    </select>
    <p>详情展示六种商品的初始快照；列表中的补货和编辑保留在当前页面。</p>
    <ProductDetails productId={productId} />
  </>;
}
