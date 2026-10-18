import { useActionState } from "react";

export default function SignatureFixed() {
  async function save(previousState, formData) {
    return `收到 ${formData.get("productId")}`;
  }
  const [message, submitAction, pending] = useActionState(save, "尚未提交");
  return <form action={submitAction}>
    <input type="hidden" name="productId" value="P001" />
    <button disabled={pending}>提交编号</button>
    <p role="status">{message}</p>
  </form>;
}
