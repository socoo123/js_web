// 有问题的写法：把位置当成身份，删除后旧草稿会留给另一件商品。
import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import EditableRow from "./EditableRow.jsx";

export default function IndexKeysBroken() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts.slice(0, 3)));
  function handleDelete(id) {
    setProducts((pending) => pending.filter((product) => product.id !== id));
  }
  return <section className="product-list">{products.map((product, index) =>
    <EditableRow key={index} product={product} onDelete={handleDelete} />
  )}</section>;
}
