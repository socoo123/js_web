import { useEffect, useRef, useState } from "react";

export default function InventoryCounter() {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  function handleThree() {
    setCount((pending) => pending + 1);
    setCount((pending) => pending + 1);
    setCount((pending) => pending + 1);
  }
  function handleLater() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPending(false);
      setCount((n) => n + 3);
    }, 2000);
    setPending(true);
  }
  function handleCancel() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setPending(false);
  }
  return (
    <section aria-label="盘点计数">
      <h2>本次盘点</h2>
      <p role="status">已记录 {count} 次盘点操作</p>
      <button type="button" onClick={() => setCount((n) => n + 1)}>记录 1 次</button>{" "}
      <button type="button" onClick={handleThree}>连续记录 3 次</button>{" "}
      <button type="button" onClick={handleLater}>2 秒后记录 3 次</button>
      {" "}<button type="button" onClick={handleCancel} disabled={!pending}>取消延时记录</button>
      <p>{pending ? "有一条延时记录等待执行；再次安排会替换它。" : "没有等待中的延时记录。"}</p>
    </section>
  );
}
