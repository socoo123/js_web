// region detail-state
import React, { useEffect, useState } from "react";
import { getProduct } from "../services/product-api.js";
export default function ProductDetail({ productId, fail = false, loadProduct = getProduct }) {
  const [request, setRequest] = useState({ id: null, status: "loading" });
  const [attempt, setAttempt] = useState(0);
// endregion detail-state
// region detail-effect
  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setRequest({ id: productId, status: "loading" });
    async function load() {
      try {
        const product = await loadProduct(productId, { signal: controller.signal, fail });
        if (!ignore) setRequest({ id: productId, status: "success", product });
      } catch (error) {
        if (!ignore && error.name !== "AbortError")
          setRequest({ id: productId, status: "error", error: error.message });
      }
    }
    load();
    return () => { ignore = true; controller.abort(); };
  }, [productId, fail, attempt, loadProduct]);
// endregion detail-effect
// region detail-view
  const visible = request.id === productId ? request : { status: "loading" };
  return <section aria-label="商品详情">
    {visible.status === "loading" && <p role="status">正在加载 {productId}</p>}
    {visible.status === "error" && <p role="alert">{visible.error}</p>}
    {visible.status === "success" && <p>{visible.product.id} {visible.product.name}：库存 {visible.product.stock}</p>}
    <button onClick={() => setAttempt((previous) => previous + 1)}>重试详情</button>
  </section>;
}
// endregion detail-view
