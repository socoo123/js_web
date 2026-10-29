import React, { useRef, useState } from "react";
import { Alert, Button, ConfigProvider, Input, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import seed from "../../data/products.json";
import { selectProducts, summarize } from "../../src/core/inventory.js";
import { createInventoryRepository } from "../../src/services/inventory-repository.js";
import { selectProduct } from "./select-product.js";
import ProductTable from "./ProductTable.jsx";
import ProductEditor from "./ProductEditor.jsx";

const repository = createInventoryRepository({ storage: null, seed });
export default function App({ inventoryRepository = repository }) {
  const cache = useQueryClient();
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [editor, setEditor] = useState(null);
  const trigger = useRef(null);
  const list = useQuery({ queryKey: ["antd", "products"], queryFn: () => inventoryRepository.list() });
  const saveMutation = useMutation({
    mutationFn: (product) => inventoryRepository.save(product),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["antd", "products"] }),
  });
  const products = list.data ?? [];
  const visible = selectProducts(products, { query });
  const summary = summarize(products);

  function openEditor(row, button) {
    const product = selectProduct(products, row);
    if (!product) return;
    trigger.current = button;
    setEditor({ product: structuredClone(product), open: true });
  }
  function closeEditor() { setEditor((current) => current && { ...current, open: false }); }
  async function save(product) {
    await saveMutation.mutateAsync(product);
    closeEditor();
  }
  function afterClose() { setEditor(null); trigger.current?.focus(); }

  return <ConfigProvider locale={zhCN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
    <div className="antd-page" data-theme={dark ? "dark" : "light"}><main>
      <h1>Ant Design 库存适配</h1>
      <p>独立固定数据；刷新重置，不影响 React 主应用的本地库存。</p>
      <div className="antd-toolbar">
        <label className="antd-search">名称或编号<Input aria-label="名称或编号" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <Button onClick={() => setQuery("")}>清空筛选</Button>
        <Button onClick={() => setDark(!dark)}>{dark ? "切换浅色" : "切换深色"}</Button>
      </div>
      <p id="antd-summary" role="status">全部 {summary.count} 种 / 总库存 {summary.stock} / 总价值 {summary.valueCents} 分</p>
      {list.isPending ? <p role="status">正在读取商品…</p> : list.error
        ? <Alert type="error" title={list.error.message} action={<Button onClick={() => list.refetch()}>重试读取</Button>} />
        : <ProductTable products={visible} onEdit={openEditor} />}
      {editor && <ProductEditor product={editor.product} open={editor.open} onSave={save} onCancel={closeEditor} afterClose={afterClose} />}
    </main></div>
  </ConfigProvider>;
}
