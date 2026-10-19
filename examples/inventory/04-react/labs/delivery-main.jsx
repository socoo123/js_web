import { useState } from "react";
import { createRoot } from "react-dom/client";
import ProductDetails from "../src/ProductDetails.jsx";
import { fetchProduct } from "../src/product-api.js";
import { readProductResponse } from "../src/read-product.js";
import { initializeInventory, readInventorySnapshot } from "../src/inventory-storage.js";
import MutationBroken from "./MutationBroken.jsx";
import MutationFixed from "./MutationFixed.jsx";
import MemoryProbe from "./MemoryProbe.jsx";
import "../src/styles.css";
import "./delivery.css";

const storageKey = "js_web:c45:products:v1";
async function loadMissingProduct(id, { signal }) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/products/missing.json`,
    { signal, headers: { Accept: "application/json" } });
  return readProductResponse(response, id);
}
async function loadHtmlResponse(id, { signal }) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/products/missing.json`, { signal });
  return readProductResponse(response, id);
}
function StorageCase() {
  const [result, setResult] = useState(null);
  function read(raw) {
    if (raw === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, raw);
    setResult(initializeInventory(() => readInventorySnapshot(localStorage, storageKey)));
  }
  return <section aria-label="存储现场">
    <button onClick={() => read("{")}>写入损坏副本并读取</button>{" "}
    <button onClick={() => read(null)}>清除实验副本</button>
    {result && <><p role="status">{result.message}</p>
      <p>总库存 {result.products.reduce((sum, product) => sum + product.stock, 0)}</p></>}
  </section>;
}
function MemoryCase({ leaky }) {
  const [open, setOpen] = useState(false);
  return <section aria-label="监听器生命周期">
    <button onClick={() => setOpen((value) => !value)}>{open ? "关闭探针" : "开启探针"}</button>
    {open && <MemoryProbe leaky={leaky} />}
    <p>每次重新比较先刷新；错误版故意保留 window 监听器。</p>
  </section>;
}
function DeliveryLab() {
  const mode = new URLSearchParams(location.search).get("case") ?? "asset";
  const modes = ["asset", "asset-answer", "request", "request-answer", "html-response", "state", "state-answer",
    "overflow", "overflow-answer", "storage", "memory", "memory-answer"];
  let content;
  if (mode.startsWith("asset")) content = <section><h2>库存标识资源</h2>
    <img alt="库存" width="96" height="96" src={mode === "asset"
      ? "/media/inventory.svg" : `${import.meta.env.BASE_URL}media/inventory.svg`} /></section>;
  else if (mode.startsWith("request") || mode === "html-response") content = <ProductDetails productId="P002"
    loadProduct={mode === "request" ? loadMissingProduct : mode === "html-response" ? loadHtmlResponse : fetchProduct} />;
  else if (mode.startsWith("state")) content = mode === "state" ? <MutationBroken /> : <MutationFixed />;
  else if (mode.startsWith("overflow")) content = <section className={mode === "overflow" ? "delivery-panel broken-panel" : "delivery-panel"}>
    <h2>待交付库存表</h2><p>P001 机械键盘 · 库存 12</p><button>保存检查结果</button></section>;
  else if (mode === "storage") content = <StorageCase />;
  else if (mode.startsWith("memory")) content = <MemoryCase leaky={mode === "memory"} />;
  else content = <p>未知实验，请选择上方入口。</p>;
  return <main><h1>交付前排错实验</h1><nav aria-label="排错实验">
    {modes.map((name) => <a key={name} href={`?case=${name}`}>{name}</a>)}
  </nav>{content}</main>;
}
createRoot(document.getElementById("root")).render(<DeliveryLab />);
