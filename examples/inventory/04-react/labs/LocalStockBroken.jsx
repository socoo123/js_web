// 有问题的写法：子组件复制业务库存，父组件统计仍读旧记录。
import { useState } from "react";
import { products } from "../../../shared/products.js";

function StockRow({ product }) {
  const [stock, setStock] = useState(product.stock);
  return <div><p>鼠标库存：{stock} 件</p>
    <button onClick={() => setStock(stock + 1)}>给鼠标补 1 件</button></div>;
}
export default function LocalStockBroken() {
  const [items] = useState(products);
  return <><StockRow product={items[1]} />
    <p role="status">总库存 {items.reduce((sum, product) => sum + product.stock, 0)} 件</p></>;
}
