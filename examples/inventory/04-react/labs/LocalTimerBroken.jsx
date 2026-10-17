// 有问题的写法：句柄随组件重新执行而丢失
import { useState } from "react";

export default function LocalTimerBroken() {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  let timer = null;
  function handleLater() {
    timer = setTimeout(() => {
      setCount((n) => n + 3);
      setPending(false);
    }, 2000);
    setPending(true);
  }
  function handleCancel() {
    clearTimeout(timer);
    setPending(false);
  }
  return <section>
    <p role="status">已记录 {count} 次盘点操作</p>
    <button onClick={handleLater}>2 秒后记录 3 次</button>
    <button onClick={handleCancel} disabled={!pending}>取消延时记录</button>
  </section>;
}
