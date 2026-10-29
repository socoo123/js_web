// region react-adapter-state
import React, { useEffect, useState } from "react";
import { Input } from "@ui5/webcomponents-react/Input";
import { List } from "@ui5/webcomponents-react/List";
import { ListItemStandard } from "@ui5/webcomponents-react/ListItemStandard";
import { selectProducts, summarize } from "../../src/core/inventory.js";
import { createInventoryRepository } from "../../src/services/inventory-repository.js";
import ProductEditor from "./ProductEditor.jsx";
import Settings from "./Settings.jsx";
export default function App({ inventoryRepository } = {}) {
  const [repository] = useState(() => inventoryRepository ?? createInventoryRepository({ storage: null }));
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    repository.list().then((items) => { if (active) setProducts(items); })
      .catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [repository]);
// endregion react-adapter-state
// region react-adapter-save
  const visible = selectProducts(products, { query });
  const summary = summarize(products);
  const selected = products.find((product) => product.id === selectedId);
  function closeEditor() {
    const id = selectedId;
    setSelectedId(null);
    requestAnimationFrame(() => (document.getElementById(`product-${id}`)
      ?? document.getElementById("app-heading"))?.focus());
  }
  async function save(product) {
    setSaving(true);
    try {
      await repository.save(product);
      setProducts(await repository.list());
      setSavedCount((count) => count + 1);
      closeEditor();
    } finally { setSaving(false); }
  }
// endregion react-adapter-save
// region react-adapter-list
  const list = <List accessibleName="商品列表" noDataText="没有匹配的商品"
    onItemClick={(event) => setSelectedId(event.detail.item.dataset.productId)}>
    {visible.map((product) => <ListItemStandard key={product.id} id={`product-${product.id}`}
      data-product-id={product.id} type="Active" accessibleName={`编辑 ${product.id}`}
      description={`${product.id} · ${product.category} · 库存 ${product.stock} 件`}
      additionalText={`${product.priceCents} 分 · ${product.tags.join("、") || "无标签"}`}>
      {product.name}
    </ListItemStandard>)}
  </List>;
// endregion react-adapter-list
// region react-adapter-editor
  return <main>
    <h1 id="app-heading" tabIndex={-1}>UI5 React 库存适配</h1>
    <Settings />
    <Input accessibleName="筛选商品" placeholder="名称或编号" showClearIcon disabled={saving}
      value={query} onInput={(event) => setQuery(event.target.value)} />
    <p id="summary" aria-live="polite">全部 {summary.count} 种 · 总库存 {summary.stock} · 总价值 {summary.valueCents} 分</p>
    <p id="save-count" role="status">已确认保存 {savedCount} 次</p>
    {error && <p role="alert">{error}</p>}
    <div className="inventory-grid">
      <section aria-label="商品列表" inert={saving}>{list}</section>
      <section aria-label="编辑区">
        {selected ? <ProductEditor key={selectedId} product={selected} onSave={save} onCancel={closeEditor} />
          : <p>选择商品后，只修改库存。刷新恢复固定数据。</p>}
      </section>
    </div>
  </main>;
}
// endregion react-adapter-editor
