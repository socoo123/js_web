import { useState } from "react";
import { categories, toDraft, validateDraft } from "./product-form.js";

export default function ProductForm({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [errors, setErrors] = useState({});
  const prefix = `edit-${product.id}`;

  function change(field, value) {
    setDraft((pending) => ({ ...pending, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateDraft(draft, product.tags);
    setErrors(result.errors);
    if (result.value === null) {
      const firstField = Object.keys(result.errors)[0];
      event.currentTarget.elements.namedItem(firstField)?.focus();
      return;
    }
    onSave(product.id, result.value);
  }

  const fieldProps = (field) => ({
    id: `${prefix}-${field}`, name: field,
    "aria-invalid": errors[field] ? "true" : undefined,
    "aria-describedby": errors[field] ? `${prefix}-${field}-error` : undefined,
  });
  const errorMessage = (field) => errors[field] &&
    <p className="field-error" id={`${prefix}-${field}-error`}>{errors[field]}</p>;

  return (
    <form className="product-form" noValidate onSubmit={handleSubmit} aria-labelledby={`${prefix}-title`}>
      <h3 id={`${prefix}-title`}>编辑 {product.id}</h3>
      <p>名称、分类、库存、单价均为必填。保存前只修改草稿。</p>
      {Object.keys(errors).length > 0 && <p role="alert">保存失败，请检查下面的字段。</p>}
      <label htmlFor={`${prefix}-name`}>商品名称（必填）</label>
      <input {...fieldProps("name")} required autoFocus value={draft.name}
        onChange={(event) => change("name", event.target.value)} />
      {errorMessage("name")}
      <label htmlFor={`${prefix}-category`}>商品分类（必填）</label>
      <select {...fieldProps("category")} required value={draft.category}
        onChange={(event) => change("category", event.target.value)}>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      {errorMessage("category")}
      <label htmlFor={`${prefix}-stock`}>库存数量（必填）</label>
      <input {...fieldProps("stock")} required type="number" min="0" max="99999" step="1" value={draft.stock}
        onChange={(event) => change("stock", event.target.value)} />
      {errorMessage("stock")}
      <label htmlFor={`${prefix}-price`}>单价（元，必填）</label>
      <input {...fieldProps("price")} required inputMode="decimal" value={draft.price}
        onChange={(event) => change("price", event.target.value)} />
      {errorMessage("price")}
      <label className="checkbox-label"><input type="checkbox" name="featured" checked={draft.featured}
        onChange={(event) => change("featured", event.target.checked)} />热销标签</label>
      <div className="product-actions">
        <button type="submit">保存商品</button>
        <button type="button" onClick={onCancel}>取消编辑</button>
      </div>
    </form>
  );
}
