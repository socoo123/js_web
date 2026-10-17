import { products } from "../../../shared/products.js";

const product = products[0];

export default function ProductCard() {
  const priceLabel = (product.priceCents / 100).toFixed(2);
  return (
    <article className="product-card" aria-labelledby="product-name">
      <h2 id="product-name">{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="price">单价：¥{priceLabel}</p>
    </article>
  );
}
