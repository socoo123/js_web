import ProductCard from "./ProductCard.jsx";

export default function ProductList({ products, onRestock, onDelete, emptyMessage = "没有匹配的商品。" }) {
  if (products.length === 0) return <p role="status">{emptyMessage}</p>;
  return (
    <section className="product-list" aria-label="商品列表">
      {products.map((product) => <ProductCard key={product.id} product={product} onRestock={onRestock} onDelete={onDelete} />)}
    </section>
  );
}
