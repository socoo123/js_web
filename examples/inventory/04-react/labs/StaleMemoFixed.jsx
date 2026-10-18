import { useMemo, useState } from "react";
import { products } from "../../../shared/products.js";

export default function StaleMemoFixed() {
  const [product, setProduct] = useState(products[0]);
  const valueCents = useMemo(() => product.stock * product.priceCents, [product.stock, product.priceCents]);
  return <><p>库存 {product.stock} 件 · 价值 {(valueCents / 100).toFixed(2)} 元</p>
    <button onClick={() => setProduct({ ...product, stock: product.stock + 1 })}>补 1 件</button></>;
}
