// 有问题的写法：Hook 读不到同一组件返回的 form
import { useFormStatus } from "react-dom";

export default function StatusScopeBroken({ save = () => new Promise((resolve) => setTimeout(resolve, 1200)) }) {
  const { pending } = useFormStatus();
  return <form action={save}>
    <p role="status">{pending ? "正在提交" : "空闲"}</p>
    <button type="submit" disabled={pending}>提交表单</button>
  </form>;
}
