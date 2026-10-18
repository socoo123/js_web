// 有问题的写法：只取消 fetch，没有拦住已经进入后续处理的结果
import { useEffect, useState } from "react";
import { loadDelayedProduct } from "./request-loaders.js";

export default function AbortOnly({ productId, loadProduct = loadDelayedProduct }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    loadProduct(productId, { signal: controller.signal }).then(setData).catch((error) => {
      if (error.name !== "AbortError") console.error(error);
    });
    return () => controller.abort();
  }, [productId, loadProduct]);
  return <p role="status">当前 {productId} · 详情 {data?.id ?? "加载中"}</p>;
}
