import { useCounter } from "./useCounter.js";

export default function HookCounters() {
  const first = useCounter();
  const second = useCounter();
  return <>
    <button onClick={first.increment}>盘点 A：{first.count}</button>
    <button onClick={second.increment}>盘点 B：{second.count}</button>
  </>;
}
