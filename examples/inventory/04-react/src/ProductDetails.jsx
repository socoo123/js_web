import { useEffect, useRef, useState } from "react";
import { fetchProduct } from "./product-api.js";
import RequestView from "./RequestView.jsx";

export default function ProductDetails({ productId, loadProduct = fetchProduct }) {
  const [request, setRequest] = useState({ status: "idle", id: null });
  const [attempt, setAttempt] = useState(0);
  const cancelRef = useRef(null);
  useEffect(() => {
    if (productId === null) {
      setRequest({ status: "idle", id: null });
      return;
    }
    const controller = new AbortController();
    let ignore = false;
    setRequest({ status: "loading", id: productId });
    async function load() {
      try {
        const data = await loadProduct(productId, { signal: controller.signal });
        if (!ignore) setRequest({ status: "success", id: productId, data });
      } catch (error) {
        if (!ignore) setRequest({ status: "error", id: productId, error: error.message });
      }
    }
    load();
    function stop() {
      ignore = true;
      controller.abort();
    }
    cancelRef.current = () => {
      stop();
      setRequest({ status: "cancelled", id: productId });
    };
    return () => { stop(); cancelRef.current = null; };
  }, [productId, attempt, loadProduct]);
  const visible = productId === null ? { status: "idle", id: null }
    : request.id === productId ? request : { status: "loading", id: productId };
  return <RequestView request={visible} onCancel={() => cancelRef.current?.()}
    onRetry={() => setAttempt((n) => n + 1)} />;
}
