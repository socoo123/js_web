// 有问题的写法：最后结束的请求总能覆盖当前详情
import { useEffect, useState } from "react";
import { loadDelayedProduct } from "./request-loaders.js";

export default function RaceBroken({ productId, loadProduct = loadDelayedProduct }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData(null);
    loadProduct(productId).then(setData);
  }, [productId, loadProduct]);
  return <p role="status">当前 {productId} · 详情 {data?.id ?? "加载中"}</p>;
}
