import React, { useRef, useState } from "react";
import { Alert, Form, Input, Modal } from "antd";
import { parseStock } from "../../src/core/inventory.js";
import { cycleDialogFocus } from "./cycle-dialog-focus.js";

export default function ProductEditor({ product, open, onSave, onCancel, afterClose }) {
  const [form] = Form.useForm();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const input = useRef(null);
  const saving = useRef(false);
  const stockRule = { async validator(_rule, value) { parseStock(value); } };

  async function finish({ stock }) {
    if (saving.current) return;
    saving.current = true;
    setPending(true); setError("");
    try { await onSave({ ...product, stock: parseStock(stock) }); }
    catch (caught) { setError(caught.message); }
    finally { saving.current = false; setPending(false); }
  }

  return <Modal title={`编辑 ${product.id} ${product.name}`} open={open}
    onCancel={() => { if (!saving.current) onCancel(); }} onOk={() => form.submit()}
    okText="保存" cancelText="取消" confirmLoading={pending}
    okButtonProps={{ "aria-label": "保存" }} cancelButtonProps={{ "aria-label": "取消", disabled: pending }}
    mask={{ closable: false }} closable={!pending} keyboard={!pending} destroyOnHidden
    focusable={{ trap: true, focusTriggerAfterClose: true }} afterClose={afterClose}
    modalRender={(node) => <div onKeyDown={cycleDialogFocus}>{node}</div>}
    afterOpenChange={(visible) => { if (visible) input.current?.focus(); }}>
    <p>取消或按 Esc 丢弃草稿。只编辑库存，其他字段保持原值。</p>
    {error && <Alert type="error" title={error} />}
    <Form form={form} name="antd-stock" layout="vertical" preserve={false}
      initialValues={{ stock: String(product.stock) }} onFinish={finish}
      disabled={pending} scrollToFirstError={{ focus: true }}>
      <Form.Item name="stock" label="库存数量" rules={[stockRule]}>
        <Input ref={input} inputMode="numeric" />
      </Form.Item>
      <button type="submit" hidden>保存库存</button>
    </Form>
  </Modal>;
}
