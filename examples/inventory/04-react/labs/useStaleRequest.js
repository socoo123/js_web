// 有问题的写法：隐藏在 Hook 中的 Effect 漏掉商品编号依赖
import { useEffect, useState } from "react";
import { fetchProduct } from "../src/product-api.js";

export function useStaleRequest(productId, loadProduct = fetchProduct) {
  const [request, setRequest] = useState({ status: "idle", id: null });
  useEffect(() => {
    let ignore = false;
    setRequest({ status: "loading", id: productId });
    loadProduct(productId).then((data) => {
      if (!ignore) setRequest({ status: "success", id: productId, data });
    }).catch((error) => {
      if (!ignore) setRequest({ status: "error", id: productId, error: error.message });
    });
    return () => { ignore = true; };
  }, [loadProduct]);
  return { request, cancel: () => {}, retry: () => {} };
}
