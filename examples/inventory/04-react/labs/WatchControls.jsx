import { useState } from "react";
import ProductWatch from "./ProductWatch.jsx";

export default function WatchControls({ Watch = ProductWatch }) {
  const [productId, setProductId] = useState("P001");
  const [shown, setShown] = useState(true);
  const [note, setNote] = useState("");
  return <section>
    <button onClick={() => setProductId((id) => id === "P001" ? "P002" : "P001")}>切换商品</button>
    <button onClick={() => window.dispatchEvent(new Event("inventory-pulse"))}>发一条通知</button>
    <button onClick={() => setShown((value) => !value)}>显示或隐藏监听</button>
    <label>备注<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
    {shown && <Watch productId={productId} />}
  </section>;
}
