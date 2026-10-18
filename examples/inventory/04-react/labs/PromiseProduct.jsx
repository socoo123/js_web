import { Suspense, use } from "react";
import { products } from "../../../shared/products.js";

const productPromise = new Promise((resolve) => {
  setTimeout(() => resolve(products[0]), 1200);
});

function Product({ promise }) {
  const product = use(promise);
  return <p>{product.id} {product.name}：{product.stock} 件</p>;
}

export default function PromiseProduct() {
  return <Suspense fallback={<p>等待读取商品…</p>}>
    <Product promise={productPromise} />
  </Suspense>;
}
