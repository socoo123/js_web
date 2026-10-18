// 有问题的写法：沿用普通 form action 的单参数签名
import { useActionState } from "react";

export default function SignatureBroken() {
  async function save(formData) {
    try { return `收到 ${formData.get("productId")}`; }
    catch (error) { return error.message; }
  }
  const [message, submitAction, pending] = useActionState(save, "尚未提交");
  return <form action={submitAction}>
    <input type="hidden" name="productId" value="P001" />
    <button disabled={pending}>提交编号</button>
    <p role="status">{message}</p>
  </form>;
}
