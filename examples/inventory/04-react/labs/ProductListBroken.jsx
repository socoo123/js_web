// 有问题的写法：遍历每件商品，却总把第一件交给卡片
import ProductCard from "../src/ProductCard.jsx";

export default function ProductListBroken({ products }) {
  return (
    <section className="product-list" aria-label="商品列表">
      {products.map((product) => <ProductCard key={product.id} product={products[0]} />)}
    </section>
  );
}
