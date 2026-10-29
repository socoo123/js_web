// region editor-state
import React, { useState, useRef } from "react";
import { categories, toDraft, parseDraft } from "../core/inventory.js";
export default function ProductEditor({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const fields = useRef({});
  const [errors, setErrors] = useState({});
  function change(field, value) { setDraft((previous) => ({ ...previous, [field]: value })); }
// endregion editor-state
// region editor-submit
  function submit(event) {
    event.preventDefault();
    const parsed = parseDraft(draft);
    setErrors(parsed.errors);
    if (parsed.hasErrors) {
      const field = ["name", "stock", "price", "category"].find((key) => parsed.errors[key]);
      fields.current[field]?.focus();
      return;
    }
    try { onSave(parsed.value); }
    catch (error) { setErrors({ form: error.message }); }
  }
// endregion editor-submit
// region editor-fields
  return <form aria-label="商品编辑" noValidate onSubmit={submit}>
    <h2>编辑 {product.id}</h2>
    {[["name", "名称"], ["stock", "库存"], ["price", "价格（元）"]].map(([field, label]) =>
      <div key={field}><label htmlFor={`edit-${field}`}>{label}</label>
        <input ref={(node) => { fields.current[field] = node; }}
          id={`edit-${field}`} name={field} autoFocus={field === "name"}
          inputMode={field === "stock" ? "numeric" : field === "price" ? "decimal" : "text"}
          value={draft[field]} onChange={(event) => change(field, event.target.value)}
          aria-invalid={Boolean(errors[field])} aria-describedby={`error-${field}`} />
        <p id={`error-${field}`} role="alert">{errors[field]}</p>
      </div>)}
    <label>编辑分类 <select ref={(node) => { fields.current.category = node; }}
      aria-label="编辑分类" name="category" value={draft.category}
      aria-invalid={Boolean(errors.category)} aria-describedby="error-category"
      onChange={(event) => change("category", event.target.value)}>
      {categories.map((name) => <option key={name}>{name}</option>)}
    </select></label>
    <p id="error-category" role="alert">{errors.category}</p>
    <p role="alert">{errors.form}</p>
    <button type="submit">保存</button><button type="button" onClick={onCancel}>取消</button>
  </form>;
}
// endregion editor-fields
