// region request-state
import { useEffect, useState } from "react";
import { getProduct } from "../services/product-api.js";
export function useProductRequest(productId, { fail = false, loadProduct = getProduct } = {}) {
  const [request, setRequest] = useState({ id: null, status: "loading" });
  const [attempt, setAttempt] = useState(0);
// endregion request-state
// region request-effect
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
// endregion request-effect
// region request-result
  const visible = request.id === productId ? request : { status: "loading" };
  return { request: visible, retry: () => setAttempt((previous) => previous + 1) };
}
// endregion request-result
