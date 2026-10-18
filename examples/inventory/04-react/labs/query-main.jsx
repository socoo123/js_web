import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createInventoryQueryClient } from "../src/query-client.js";
import { createMockProductService } from "../src/mock-product-service.js";
import CachedProductDetails from "../src/CachedProductDetails.jsx";
import QueryKeyBroken from "./QueryKeyBroken.jsx";
import "../src/styles.css";

const mode = new URLSearchParams(location.search).get("case");
const client = createInventoryQueryClient();
const controls = { delay: 0, failOnce: false, failRead: false, failWrite: false };
let readCount = 0;
const service = createMockProductService({
  delayMs: () => controls.delay,
  failRead: () => {
    readCount++;
    console.log("查询尝试", readCount);
    document.getElementById("attempts").textContent = `查询尝试：${readCount}`;
    if (controls.failOnce) { controls.failOnce = false; return true; }
    return controls.failRead;
  },
  failWrite: () => controls.failWrite,
});
const loadProduct = service.getProduct;
function QueryLab() {
  const [id, setId] = useState("P001");
  const [visible, setVisible] = useState(true);
  const [second, setSecond] = useState(false);
  const Details = mode === "key-bug" ? QueryKeyBroken : CachedProductDetails;
  return <main className="app">
    <h1>查询缓存实验</h1><p>当前选择：{id}</p>
    <p id="attempts">查询尝试：0</p>
    <button onClick={() => setId("P001")}>选择 P001</button>
    <button onClick={() => setId("P002")}>选择 P002</button>
    <button onClick={() => setVisible((value) => !value)}>显示或隐藏详情</button>
    <button onClick={() => setSecond((value) => !value)}>切换第二个观察者</button>
    <label>响应速度 <select defaultValue="0" onChange={(event) => { controls.delay = Number(event.target.value); }}>
      <option value="0">快</option><option value="1500">慢</option></select></label>
    <button onClick={() => { controls.failOnce = true; }}>下次读取失败一次</button>
    <label><input type="checkbox" onChange={(event) => { controls.failRead = event.target.checked; }} />持续读取失败</label>
    <label><input type="checkbox" onChange={(event) => { controls.failWrite = event.target.checked; }} />保存失败</label>
    <p>写入只改浏览器内 mock，刷新恢复；Network 只有静态 JSON 的 GET。</p>
    {visible && <Details key={id} productId={id} loadProduct={loadProduct} saveProduct={service.restock} />}
    {second && <CachedProductDetails key={id} productId={id} loadProduct={loadProduct} saveProduct={service.restock} />}
  </main>;
}
createRoot(document.getElementById("root")).render(<StrictMode><QueryClientProvider client={client}>
  <QueryLab />
</QueryClientProvider></StrictMode>);
