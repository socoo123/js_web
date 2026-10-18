import { StrictMode, lazy, Suspense, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createInventoryQueryClient } from "../src/query-client.js";
import { createMockProductService } from "../src/mock-product-service.js";
import ActionProductDetails from "../src/ActionProductDetails.jsx";
import SimpleActionForm from "./SimpleActionForm.jsx";
import SignatureBroken from "./SignatureBroken.jsx";
import SignatureFixed from "./SignatureFixed.jsx";
import StatusScopeBroken from "./StatusScopeBroken.jsx";
import StatusScopeFixed from "./StatusScopeFixed.jsx";
import RefPropInput from "./RefPropInput.jsx";
import CustomElementStock from "./CustomElementStock.jsx";
import "../src/styles.css";

const PromiseProduct = lazy(() => import("./PromiseProduct.jsx"));
const mode = new URLSearchParams(location.search).get("case");
const client = createInventoryQueryClient();
const controls = { failWrite: false, failRead: false };
const service = createMockProductService({
  delayMs: () => 800, failWrite: () => controls.failWrite, failRead: () => controls.failRead,
});

function ActionLab() {
  const [id, setId] = useState("P001");
  const experiments = { simple: SimpleActionForm, signature: SignatureBroken,
    "signature-answer": SignatureFixed, status: StatusScopeBroken,
    "status-answer": StatusScopeFixed, ref: RefPropInput, element: CustomElementStock, use: PromiseProduct };
  const Experiment = experiments[mode];
  return <main className="app"><h1>现代 React 提交实验</h1>
    <p>提交只修改当前页面内 mock，刷新恢复；Network 中没有补货 POST。</p>
    {Experiment ? <Suspense fallback={<p>加载实验…</p>}><Experiment /></Suspense> : <>
      <button onClick={() => setId("P001")}>选择 P001</button>
      <button onClick={() => setId("P002")}>选择 P002</button>
      <label><input type="checkbox" onChange={(event) => { controls.failWrite = event.target.checked; }} />保存失败</label>
      <label><input type="checkbox" onChange={(event) => { controls.failRead = event.target.checked; }} />读回失败</label>
      <ActionProductDetails key={id} productId={id} loadProduct={service.getProduct} saveProduct={service.restock} />
    </>}
  </main>;
}
createRoot(document.getElementById("root")).render(<StrictMode><QueryClientProvider client={client}>
  <ActionLab />
</QueryClientProvider></StrictMode>);
