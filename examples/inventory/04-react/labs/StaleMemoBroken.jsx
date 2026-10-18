// 有问题的写法：空依赖把首次库存对应的价值留住了。
import { useMemo, useState } from "react";
import { products } from "../../../shared/products.js";

export default function StaleMemoBroken() {
  const [product, setProduct] = useState(products[0]);
  const valueCents = useMemo(() => product.stock * product.priceCents, []);
  return <><p>库存 {product.stock} 件 · 价值 {(valueCents / 100).toFixed(2)} 元</p>
    <button onClick={() => setProduct({ ...product, stock: product.stock + 1 })}>补 1 件</button></>;
}
