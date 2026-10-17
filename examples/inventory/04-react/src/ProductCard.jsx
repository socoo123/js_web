export default function ProductCard({ product }) {
  const priceLabel = (product.priceCents / 100).toFixed(2);
  const headingId = `product-${product.id}`;
  return (
    <article className="product-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="status">{product.stock === 0 ? "已售罄" : "有货"}</p>
      <p className="price">单价：¥{priceLabel}</p>
      {product.tags.length > 0 && <p>标签：{product.tags.join("、")}</p>}
    </article>
  );
}
