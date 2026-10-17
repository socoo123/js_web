import { useState } from "react";
import { products } from "../../../shared/products.js";
import ProductForm from "../src/ProductForm.jsx";

export default function SwitchProductFixed() {
  const [selectedId, setSelectedId] = useState("P001");
  const product = products.find((item) => item.id === selectedId);
  return <>
    <button onClick={() => setSelectedId("P001")}>选择 P001</button>
    <button onClick={() => setSelectedId("P002")}>选择 P002</button>
    <ProductForm key={product.id} product={product} onSave={() => {}} onCancel={() => {}} />
  </>;
}
