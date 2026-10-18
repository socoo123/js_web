import { useState } from "react";
import { Alert, Button, ConfigProvider, Input, Select, Space, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { categories } from "../../04-react/src/product-form.js";
import { initializeInventory, INVENTORY_STORAGE_KEY, freshProducts, writeInventorySnapshot } from "../../04-react/src/inventory-storage.js";
import { productsReducer } from "../../04-react/src/products-reducer.js";
import { nextProductId, selectProducts } from "../../04-react/src/product-state.js";
import { commitDraft, emptyProduct } from "./form-adapter.js";
import ProductTable from "./ProductTable.jsx";
import ProductEditor from "./ProductEditor.jsx";

export default function App() {
  const [initial] = useState(() => initializeInventory());
  const [products, setProducts] = useState(initial.products);
  const [notice, setNotice] = useState({ type: "info", text: initial.message });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [dark, setDark] = useState(false);
  const [editor, setEditor] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const visible = selectProducts(products, { query, category });
  const total = products.reduce((sum, p) => sum + p.stock, 0);
  const valueCents = products.reduce((sum, p) => sum + p.stock * p.priceCents, 0);

  function edit(id) {
    const product = id === null ? emptyProduct : products.find((item) => item.id === id);
    if (!product) return;
    setEditor({ id, product });
    setEditorOpen(true);
  }
  function save(draft) {
    const result = commitDraft(products, editor.id, draft);
    if (result.value === null) return result;
    if (editor.id === null) {
      const id = nextProductId(products);
      if (!id) throw new Error("商品编号已用完。");
      setProducts([...products, { id, ...result.value }]);
    } else {
      setProducts(productsReducer(products, { type: "saved", id: editor.id, changes: result.value }));
    }
    setNotice({ type: "success", text: "已更新当前页面；需要刷新后保留，请保存本地快照。" });
    setEditorOpen(false);
  }
  function persist() {
    try {
      writeInventorySnapshot(localStorage, products);
      setNotice({ type: "success", text: "本地快照已保存，刷新后保留。" });
    } catch { setNotice({ type: "error", text: "保存本地快照失败；当前页面数据仍在，请检查浏览器存储权限。" }); }
  }
  function restore() {
    try {
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      setProducts(freshProducts());
      setNotice({ type: "info", text: "已清除本地快照，恢复初始商品。" });
    } catch { setNotice({ type: "error", text: "清除本地快照失败，请检查浏览器存储权限。" }); }
  }
  return <ConfigProvider locale={zhCN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { colorPrimary: "#1677ff", borderRadius: 6 } }}>
    <main style={{ colorScheme: dark ? "dark" : "light", background: dark ? "#141414" : "#fff", color: dark ? "#fff" : "#172033" }}>
      <h1>库存管理 · Ant Design</h1>
      <p>表格和弹窗共用本地商品；快照与阶段 4 使用同一格式。</p>
      <Space wrap>
        <Button type="primary" onClick={() => edit(null)}>新增商品</Button>
        <Button onClick={persist}>保存本地快照</Button>
        <Button onClick={restore}>清除快照并恢复初始商品</Button>
        <Button onClick={() => setDark(!dark)}>{dark ? "浅色主题" : "深色主题"}</Button>
      </Space>
      <p role="status">共 {products.length} 种商品，总库存 {total} 件，库存总价值 {(valueCents / 100).toFixed(2)} 元。</p>
      <Alert type={notice.type} title={notice.text} showIcon />
      <div className="filters">
        <label htmlFor="search">搜索商品</label><Input id="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <label htmlFor="category">筛选分类</label><Select virtual={false} id="category" value={category} onChange={setCategory}
          options={["全部", ...categories].map((value) => ({ value, label: value }))} />
        <Button onClick={() => { setQuery(""); setCategory("全部"); }}>清空筛选</Button>
      </div>
      <section aria-label="商品表格">
        <ProductTable products={visible} onEdit={edit}
          onRestock={(id) => setProducts((items) => productsReducer(items, { type: "restocked", id }))}
          onRemove={(id) => setProducts((items) => productsReducer(items, { type: "removed", id }))} />
      </section>
      {editor && <ProductEditor product={editor.product} open={editorOpen} onCancel={() => setEditorOpen(false)}
        onSave={save} afterClose={() => setEditor(null)} />}
    </main>
  </ConfigProvider>;
}
