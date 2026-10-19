import { useRef, useState } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Form } from "@ui5/webcomponents-react/Form";
import { FormItem } from "@ui5/webcomponents-react/FormItem";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Option } from "@ui5/webcomponents-react/Option";
import { Select } from "@ui5/webcomponents-react/Select";
import { categories } from "../../04-react/src/product-form.js";
import { toDraft } from "./editor-state.js";

export function ProductEditor({ product, onSave }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [errors, setErrors] = useState({});
  const fields = useRef({});
  function change(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = onSave(product.id, draft);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) fields.current[first]?.focus();
  }
  function textField(field, label) {
    return (
      <FormItem labelContent={<Label for={`edit-${field}`} required>{label}</Label>}>
        <Input id={`edit-${field}`} accessibleName={label} value={draft[field]}
          ref={(element) => { fields.current[field] = element; }}
          onInput={(event) => change(field, event.target.value)}
          valueState={errors[field] ? "Negative" : "None"}
          valueStateMessage={errors[field] ? <span>{errors[field]}</span> : undefined}
          accessibleDescriptionRef={errors[field] ? `error-${field}` : undefined} />
        {errors[field] && <p className="field-error" id={`error-${field}`}>{errors[field]}</p>}
      </FormItem>
    );
  }
  return (
    <form onSubmit={submit} noValidate aria-label={`编辑 ${product.id}`}>
      <h2>编辑 {product.id} · {product.name}</h2>
      <p>切换商品会丢弃未保存的草稿。</p>
      <Form>
        {textField("name", "商品名称")}
        <FormItem labelContent={<Label for="edit-category">分类</Label>}>
          <Select id="edit-category" accessibleName="分类" value={draft.category}
            onChange={(event) => change("category", event.detail.selectedOption.value)}>
            {categories.map((category) => <Option key={category} value={category}>{category}</Option>)}
          </Select>
        </FormItem>
        {textField("stock", "库存")}
        {textField("price", "单价（元）")}
        <FormItem labelContent={<Label for="edit-featured">标签</Label>}>
          <CheckBox id="edit-featured" text="热销" accessibleName="热销" checked={draft.featured}
            onChange={(event) => change("featured", event.target.checked)} />
        </FormItem>
      </Form>
      <div className="actions">
        <Button type="Submit" design="Emphasized" icon="save">保存商品</Button>
        <Button type="Button" onClick={() => { setDraft(toDraft(product)); setErrors({}); }}>重置草稿</Button>
      </div>
      {Object.values(errors).some(Boolean) && <p role="alert">保存失败，请修正标出的字段。</p>}
    </form>
  );
}
