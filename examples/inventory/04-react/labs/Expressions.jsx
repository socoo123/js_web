import { products } from "../../../shared/products.js";

const product = products[1];

export default function Expressions() {
  return (
    <section id="expressions">
      <h2 title="product.name">{product.name}</h2>
      <p title={product.name}>库存：{product.stock ?? 12} 件</p>
      <p>单价：¥{(product.priceCents / 100).toFixed(2)}</p>
      <p>布尔值：{false}；空值：{null}；数字：{0}</p>
    </section>
  );
}
