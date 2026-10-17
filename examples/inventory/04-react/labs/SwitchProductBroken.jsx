// 有问题的写法：相同位置的表单没有按商品身份区分。
import { useState } from "react";
import { products } from "../../../shared/products.js";
import ProductForm from "../src/ProductForm.jsx";

export default function SwitchProductBroken() {
  const [selectedId, setSelectedId] = useState("P001");
  const product = products.find((item) => item.id === selectedId);
  return <>
    <button onClick={() => setSelectedId("P001")}>选择 P001</button>
    <button onClick={() => setSelectedId("P002")}>选择 P002</button>
    <ProductForm product={product} onSave={() => {}} onCancel={() => {}} />
  </>;
}
