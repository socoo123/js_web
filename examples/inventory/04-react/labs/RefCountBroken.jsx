// 有问题的写法：把需要显示的盘点数放进 ref
import { useRef, useState } from "react";

export default function RefCountBroken() {
  const countRef = useRef(0);
  const [note, setNote] = useState("");
  return <section>
    <p role="status">已盘点 {countRef.current} 次</p>
    <button onClick={() => { countRef.current += 1; }}>盘点一次</button>
    <label>备注<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </section>;
}
