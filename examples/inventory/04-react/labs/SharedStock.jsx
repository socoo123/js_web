import { useState } from "react";
import { products } from "../../../shared/products.js";
import { restockProduct } from "../src/product-state.js";

function StockRow({ product, onRestock }) {
  return <div><p>鼠标库存：{product.stock} 件</p>
    <button onClick={() => onRestock(product.id)}>给鼠标补 1 件</button></div>;
}
export default function SharedStock() {
  const [items, setItems] = useState(products);
  function handleRestock(id) {
    setItems((pending) => restockProduct(pending, id));
  }
  return <><StockRow product={items[1]} onRestock={handleRestock} />
    <p role="status">总库存 {items.reduce((sum, product) => sum + product.stock, 0)} 件</p></>;
}
