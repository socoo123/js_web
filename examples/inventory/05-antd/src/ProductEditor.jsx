import { useRef, useState } from "react";
import { Alert, Checkbox, Form, Input, Modal, Select } from "antd";
import { categories, toDraft } from "../../04-react/src/product-form.js";
import { cycleDialogFocus } from "./cycle-dialog-focus.js";
import { fieldRule } from "./form-adapter.js";

export default function ProductEditor({ product, open, onCancel, onSave, afterClose }) {
  const [form] = Form.useForm();
  const nameInput = useRef(null);
  const [error, setError] = useState("");
  function finish(values) {
    try {
      const result = onSave(values);
      if (result?.errors) {
        form.setFields(Object.entries(result.errors).map(([name, message]) => ({ name, errors: [message] })));
        form.scrollToField(Object.keys(result.errors)[0], { focus: true });
      }
    } catch (caught) { setError(caught.message); }
  }
  return <Modal title={product.id ? `编辑 ${product.id} ${product.name}` : "新增商品"} open={open}
    onCancel={onCancel} onOk={() => form.submit()} okText="保存" cancelText="取消"
    okButtonProps={{ "aria-label": "保存" }} cancelButtonProps={{ "aria-label": "取消" }}
    mask={{ closable: false }} focusable={{ trap: true, focusTriggerAfterClose: true }} destroyOnHidden
    modalRender={(node) => <div onKeyDown={cycleDialogFocus}>{node}</div>}
    afterOpenChange={(visible) => { if (visible) nameInput.current?.focus(); }} afterClose={afterClose}>
    <p>保存后更新当前页面；取消或按 Esc 丢弃本次草稿。</p>
    {error && <Alert type="error" title={error} showIcon />}
    <Form name="product-editor" form={form} layout="vertical" preserve={false}
      initialValues={toDraft(product)} onFinish={finish} scrollToFirstError={{ focus: true }}>
      <Form.Item name="name" label="商品名称" rules={[fieldRule("name")] }>
        <Input ref={nameInput} />
      </Form.Item>
      <Form.Item name="category" label="分类" rules={[fieldRule("category")] }>
        <Select virtual={false} options={categories.map((value) => ({ value, label: value }))} />
      </Form.Item>
      <Form.Item name="stock" label="库存数量" rules={[fieldRule("stock")] }>
        <Input inputMode="numeric" />
      </Form.Item>
      <Form.Item name="price" label="价格（元）" rules={[fieldRule("price")] }>
        <Input inputMode="decimal" />
      </Form.Item>
      <Form.Item name="featured" valuePropName="checked"><Checkbox>热销</Checkbox></Form.Item>
      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">提交</button>
    </Form>
  </Modal>;
}
