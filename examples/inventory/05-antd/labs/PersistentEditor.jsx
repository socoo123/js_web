import { Form, Input, Modal } from "antd";
import { toDraft } from "../../04-react/src/product-form.js";

// 有问题的写法：同一表单实例保留草稿，却把 initialValues 当作每次打开的赋值。
export default function PersistentEditor({ product, open, onCancel }) {
  return <Modal title={`编辑 ${product.id} ${product.name}`} open={open} onCancel={onCancel} footer={null}>
    <Form name="persistent-editor" initialValues={toDraft(product)} layout="vertical">
      <Form.Item name="stock" label="库存数量"><Input /></Form.Item>
    </Form>
  </Modal>;
}
