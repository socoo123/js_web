import { useState } from "react";

function Count({ tone }) {
  const [count, setCount] = useState(0);
  return <button className={tone} onClick={() => setCount(count + 1)}>盘点 {count} 次</button>;
}
export default function IdentityProbe() {
  const [highlight, setHighlight] = useState(false);
  const [boxed, setBoxed] = useState(false);
  const [visible, setVisible] = useState(true);
  return <>
    <button onClick={() => setHighlight(!highlight)}>切换强调</button>
    <button onClick={() => setBoxed(!boxed)}>更换容器类型</button>
    <button onClick={() => setVisible(!visible)}>显示或隐藏计数器</button>
    {visible && (boxed
      ? <section>{highlight ? <Count tone="status" /> : <Count tone="" />}</section>
      : <div>{highlight ? <Count tone="status" /> : <Count tone="" />}</div>)}
  </>;
}
