import { useState } from "react";

export default function ReviewQueryCase({ Details, loadProduct }) {
  const [productId, setProductId] = useState("P001");
  return <section aria-label="请求复盘">
    <p>当前编号 {productId}</p>
    <button onClick={() => setProductId("P001")}>选择键盘</button>{" "}
    <button onClick={() => setProductId("P002")}>选择鼠标</button>
    <Details productId={productId} loadProduct={loadProduct} />
  </section>;
}
