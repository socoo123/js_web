import { useFormStatus } from "react-dom";

function SubmitStatus() {
  const { pending } = useFormStatus();
  return <><p role="status">{pending ? "正在提交" : "空闲"}</p>
    <button type="submit" disabled={pending}>提交表单</button></>;
}

export default function StatusScopeFixed({ save = () => new Promise((resolve) => setTimeout(resolve, 1200)) }) {
  return <form action={save}><SubmitStatus /></form>;
}
