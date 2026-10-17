import { useContext } from "react";
import { ProductsContext } from "./InventoryContext.jsx";

export default function InventorySummary() {
  const products = useContext(ProductsContext);
  if (products === null) throw new Error("InventorySummary 需要 InventoryProvider");
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalCents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
  return <p>全部：{products.length} 种 · 总库存 {totalStock} 件 · 库存总价值 ¥{(totalCents / 100).toFixed(2)}</p>;
}
