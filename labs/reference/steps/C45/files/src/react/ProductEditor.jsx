// region action-state
import React, { useState, useRef, useEffect, useActionState, useOptimistic } from "react";
import { categories, toDraft, parseDraft } from "../core/inventory.js";
// 服务端 422 的 fields 用商品字段名；价格输入框对应 priceCents，其他字段放到表单底部。
const inputs = { name: "name", stock: "stock", priceCents: "price", category: "category" };
function serverErrors(fields) {
  const errors = {};
  const others = [];
  for (const [field, message] of Object.entries(fields)) {
    if (inputs[field]) errors[inputs[field]] = message; else others.push(message);
  }
  if (others.length) errors.form = `保存失败：${others.join("；")}`;
  return errors;
}
export default function ProductEditor({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [conflict, setConflict] = useState(null);
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
      if (error.status === 409) { setConflict(error.current); return { errors: {}, message: "" }; }
      if (error.fields) return { errors: serverErrors(error.fields), message: "" };
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
    {conflict && <>
      <p role="alert">保存冲突：服务器上的 {product.id} 已被修改（库存 {conflict.stock}）。草稿已保留，可载入最新后再保存。</p>
      <button type="button" onClick={() => { setDraft(toDraft(conflict)); setConflict(null); }}>载入最新</button>
    </>}
    {!pending && result.message && <p role="status">{result.message}</p>}
  </form>;
}
// endregion action-fields
