import { useContext, useEffect } from "react";
import { ProductsContext } from "./InventoryContext.jsx";

export default function InventoryTitle() {
  const products = useContext(ProductsContext);
  if (products === null) throw new Error("InventoryTitle 需要 InventoryProvider");
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `库存管理 · ${totalStock} 件`;
    return () => { document.title = previousTitle; };
  }, [totalStock]);
  return null;
}
