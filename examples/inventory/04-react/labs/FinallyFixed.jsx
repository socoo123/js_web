import { useEffect, useState } from "react";
import { loadDelayedProduct } from "./request-loaders.js";

export default function FinallyFixed({ productId, loadProduct = loadDelayedProduct }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setData(null);
    loadProduct(productId).then((data) => {
      if (!ignore) setData(data);
    }).finally(() => {
      if (!ignore) setLoading(false);
    });
    return () => { ignore = true; };
  }, [productId, loadProduct]);
  return <p role="status">当前 {productId} · {loading ? "加载中" : "未加载"} · 详情 {data?.id ?? "无"}</p>;
}
