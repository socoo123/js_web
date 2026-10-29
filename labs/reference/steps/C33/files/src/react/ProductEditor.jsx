// region action-state
import React, { useState, useRef, useEffect, useActionState, useOptimistic } from "react";
import { categories, toDraft, parseDraft } from "../core/inventory.js";
export default function ProductEditor({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const fields = useRef({});
  const submitting = useRef(false);
  const [previewStock, preview] = useOptimistic(product.stock);
  const [result, submitAction, pending] = useActionState(saveAction, { errors: {}, message: "" });
  const errors = result.errors;
  function change(field, value) { setDraft((previous) => ({ ...previous, [field]: value })); }
  useEffect(() => {
    const firstError = ["name", "stock", "price", "category"].find((field) => errors[field]);
    if (!pending) fields.current[firstError]?.focus();
  }, [pending, errors]);
// endregion action-state
// region action-submit
  async function saveAction(previousState, formData) {
    try {
      if (formData.get("productId") !== product.id) throw new Error("商品编号不匹配，请重新打开编辑器");
      const parsed = parseDraft(draft);
      if (parsed.hasErrors) {
        return { errors: parsed.errors, message: "" };
      }
      preview(parsed.value.stock);
      await onSave(parsed.value);
      return { errors: {}, message: "保存完成" };
    } catch (error) {
      return { errors: { form: `保存失败：${error.message}` }, message: "" };
    } finally { submitting.current = false; }
  }
  function guardSubmit(event) {
    if (submitting.current || pending) event.preventDefault();
    else submitting.current = true;
  }
// endregion action-submit
// region action-fields
  return <form aria-label="商品编辑" noValidate action={submitAction} onSubmit={guardSubmit} aria-busy={pending}
    onReset={(event) => event.preventDefault()}>
    <h2>编辑 {product.id}</h2>
    <input type="hidden" name="productId" value={product.id} />
    <fieldset disabled={pending}>
      <legend>商品资料</legend>
      {[["name", "名称"], ["stock", "库存"], ["price", "价格（元）"]].map(([field, label]) =>
        <div key={field}><label htmlFor={`edit-${field}`}>{label}</label>
          <input ref={(node) => { fields.current[field] = node; }} autoFocus={field === "name"}
            inputMode={field === "stock" ? "numeric" : field === "price" ? "decimal" : "text"}
            id={`edit-${field}`} name={field} value={draft[field]} onChange={(event) => change(field, event.target.value)}
            aria-invalid={Boolean(errors[field])} aria-describedby={`error-${field}`} />
          {errors[field] && <p id={`error-${field}`} role="alert">{errors[field]}</p>}
        </div>)}
      <label>编辑分类 <select ref={(node) => { fields.current.category = node; }} aria-label="编辑分类" name="category" value={draft.category} onChange={(event) => change("category", event.target.value)}
        aria-invalid={Boolean(errors.category)} aria-describedby="error-category">
        {categories.map((name) => <option key={name}>{name}</option>)}
      </select></label>
      {errors.category && <p id="error-category" role="alert">{errors.category}</p>}
      <button type="submit">{pending ? "正在保存…" : "保存"}</button>
      <button type="button" onClick={() => onCancel()}>取消</button>
    </fieldset>
    <p role="status">预览库存 {previewStock} 件{pending ? "（等待确认）" : "（已保存）"}</p>
    {errors.form && <p role="alert">{errors.form}</p>}
    {!pending && result.message && <p role="status">{result.message}</p>}
  </form>;
}
// endregion action-fields
