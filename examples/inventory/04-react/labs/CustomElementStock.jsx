import { useState } from "react";
import { products } from "../../../shared/products.js";
import "./stock-badge.js";

export default function CustomElementStock() {
  const [selected, setSelected] = useState("");
  return <><stock-badge product={products[0]}
    onstock-check={(event) => setSelected(event.detail.id)} />
    <p role="status">已检查：{selected || "尚无"}</p></>;
}
