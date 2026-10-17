import { useState } from "react";

export default function InventoryCounter() {
  const [count, setCount] = useState(0);
  function handleThree() {
    setCount((pending) => pending + 1);
    setCount((pending) => pending + 1);
    setCount((pending) => pending + 1);
  }
  function handleLater() {
    setTimeout(() => setCount((pending) => pending + 3), 2000);
  }
  return (
    <section aria-label="盘点计数">
      <h2>本次盘点</h2>
      <p role="status">已记录 {count} 次盘点操作</p>
      <button type="button" onClick={() => setCount((n) => n + 1)}>记录 1 次</button>{" "}
      <button type="button" onClick={handleThree}>连续记录 3 次</button>{" "}
      <button type="button" onClick={handleLater}>2 秒后记录 3 次</button>
    </section>
  );
}
