export default function ReviewSummaryFixed({ products }) {
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  return <p>统计库存 {totalStock} 件</p>;
}
