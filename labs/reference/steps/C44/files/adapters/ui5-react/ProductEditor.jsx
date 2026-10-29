// region react-editor-state
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@ui5/webcomponents-react/Input";
import { Button } from "@ui5/webcomponents-react/Button";
import { Form } from "@ui5/webcomponents-react/Form";
import { FormItem } from "@ui5/webcomponents-react/FormItem";
import { Label } from "@ui5/webcomponents-react/Label";
import { toDraft, parseDraft } from "../../src/core/inventory.js";
export default function ProductEditor({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const stockInput = useRef(null);
  useEffect(() => { stockInput.current?.focus(); }, []);
// endregion react-editor-state
// region react-editor-submit
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const parsed = parseDraft(draft);
    setErrors(parsed.errors);
    if (parsed.hasErrors) { stockInput.current?.focus(); return; }
    submitting.current = true;
    setPending(true);
    try { await onSave(parsed.value); }
    catch (error) { setErrors({ form: `保存失败：${error.message}` }); }
    finally { submitting.current = false; setPending(false); }
  }
// endregion react-editor-submit
// region react-editor-fields
  return <form aria-label={`编辑 ${product.id}`} noValidate onSubmit={submit} aria-busy={pending}>
    <h2>编辑 {product.id} · {product.name}</h2>
    <Form>
      <FormItem labelContent={<Label for="edit-stock">库存</Label>}>
        <Input id="edit-stock" name="stock" accessibleName="库存" ref={stockInput}
          value={draft.stock} disabled={pending}
          onInput={(event) => setDraft((previous) => ({ ...previous, stock: event.target.value }))}
          valueState={errors.stock ? "Negative" : "None"} accessibleDescriptionRef="stock-error"
          valueStateMessage={<span>{errors.stock}</span>} />
      </FormItem>
    </Form>
    {errors.stock && <p id="stock-error" role="alert">{errors.stock}</p>}
    {errors.form && <p role="alert">{errors.form}</p>}
    <div className="actions">
      <Button type="Submit" design="Emphasized" icon="save" disabled={pending}>
        {pending ? "正在保存…" : "保存库存"}
      </Button>
      <Button type="Button" disabled={pending} onClick={onCancel}>取消</Button>
    </div>
  </form>;
}
// endregion react-editor-fields
