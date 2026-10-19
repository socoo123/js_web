import { useState } from "react";
import { Card } from "@ui5/webcomponents-react/Card";
import { CardHeader } from "@ui5/webcomponents-react/CardHeader";
import { FlexBox } from "@ui5/webcomponents-react/FlexBox";
import { Input } from "@ui5/webcomponents-react/Input";
import { products as initialProducts } from "../../../shared/products.js";
import { ProductEditor } from "./ProductEditor.jsx";
import { ProductList } from "./ProductList.jsx";
import { Settings } from "./Settings.jsx";
import { saveDraft, summarize } from "./editor-state.js";

export function App() {
  const [products, setProducts] = useState(() => structuredClone(initialProducts));
  const [selectedId, setSelectedId] = useState("P001");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("修改只保存在当前页面；刷新恢复初始商品。");
  const selected = products.find((product) => product.id === selectedId);
  const visible = products.filter((product) => `${product.id} ${product.name}`.includes(query.trim()));
  function save(id, draft) {
    const result = saveDraft(products, id, draft);
    if (result.value) {
      setProducts(result.products);
      setMessage(`${id} 已保存。`);
    } else setMessage(`${id} 保存失败。`);
    return result.errors;
  }
  return (
    <main>
      <h1>UI5 React · 库存编辑</h1>
      <Settings />
      <FlexBox direction="Row" wrap="Wrap" alignItems="Center" className="toolbar">
        <Input accessibleName="搜索商品" placeholder="商品名或编号" value={query}
          showClearIcon onInput={(event) => setQuery(event.target.value)} />
        <p id="summary">{products.length} 件商品 · {summarize(products)}</p>
      </FlexBox>
      <p role="status" aria-live="polite">{message}</p>
      <div className="workspace">
        <Card header={<CardHeader titleText="商品列表" subtitleText={`匹配 ${visible.length} 件；选择商品进入编辑`} />}>
          <ProductList products={visible} selectedId={selectedId} onSelect={setSelectedId} />
        </Card>
        <section className="editor" aria-label="商品编辑区">
          <ProductEditor key={selectedId} product={selected} onSave={save} />
        </section>
      </div>
    </main>
  );
}
