import { useFormStatus } from "react-dom";

export default function RestockSubmit({ disabled = false }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending}>
    {pending ? "正在提交并更新…" : "Action 模拟补 1 件"}
  </button>;
}
