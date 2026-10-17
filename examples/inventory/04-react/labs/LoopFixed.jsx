export default function LoopFixed({ products }) {
  const visible = products.filter((product) => product.stock > 0);
  return <p role="status">有货 {visible.length} 种</p>;
}
