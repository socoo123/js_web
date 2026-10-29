import React from "react";
import { useProductRequest } from "./useProductRequest.js";
export default function ProductDetail({ productId, fail = false, loadProduct }) {
  const { request: visible, retry } = useProductRequest(productId, { fail, loadProduct });
  return <section aria-label="商品详情">
    {visible.status === "loading" && <p role="status">正在加载 {productId}</p>}
    {visible.status === "error" && <p role="alert">{visible.error}</p>}
    {visible.status === "success" && <p>{visible.product.id} {visible.product.name}：库存 {visible.product.stock}</p>}
    <button onClick={retry}>重试详情</button>
  </section>;
}
