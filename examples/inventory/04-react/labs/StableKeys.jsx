import { useState } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import EditableRow from "./EditableRow.jsx";

export default function StableKeys() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts.slice(0, 3)));
  function handleDelete(id) {
    setProducts((pending) => pending.filter((product) => product.id !== id));
  }
  return <section className="product-list">{products.map((product) =>
    <EditableRow key={product.id} product={product} onDelete={handleDelete} />
  )}</section>;
}
