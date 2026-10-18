import { useState } from "react";
import ProductDetails from "../src/ProductDetails.jsx";
import { loadDelayedProduct } from "./request-loaders.js";

export default function RequestControls({ Details = ProductDetails, loadProduct = loadDelayedProduct }) {
  const [productId, setProductId] = useState("P001");
  const [shown, setShown] = useState(true);
  return <>
    <p>先选 P001，看到 Console 的“收到文件”后选 P002；反向切换可观察旧 finally。</p>
    <button onClick={() => setProductId("P001")}>选择 P001</button>
    <button onClick={() => setProductId("P002")}>选择 P002</button>
    <button onClick={() => setShown((value) => !value)}>显示或隐藏详情</button>
    {shown && <Details productId={productId} loadProduct={loadProduct} />}
  </>;
}
