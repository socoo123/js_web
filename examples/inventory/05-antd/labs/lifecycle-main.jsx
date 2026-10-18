import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, ConfigProvider, Space } from "antd";
import { products } from "../../../shared/products.js";
import PersistentEditor from "./PersistentEditor.jsx";
import ProductEditor from "../src/ProductEditor.jsx";
import "../src/styles.css";

function Lab() {
  const broken = new URLSearchParams(location.search).get("case") !== "fixed";
  const [product, setProduct] = useState(broken ? products[0] : null);
  const [open, setOpen] = useState(false);
  const props = { product, open, onCancel: () => setOpen(false) };
  return <ConfigProvider><main>
    <h1>弹窗草稿实验 · {broken ? "错误起点" : "正确参考"}</h1>
    <Space>{products.slice(0, 2).map((item) => <Button key={item.id}
      onClick={() => { setProduct(item); setOpen(true); }}>编辑{item.name}</Button>)}</Space>
    {broken ? <PersistentEditor {...props} /> : product && <ProductEditor {...props}
      onSave={() => setOpen(false)} afterClose={() => setProduct(null)} />}
  </main></ConfigProvider>;
}
createRoot(document.getElementById("root")).render(<Lab />);
