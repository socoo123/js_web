import { useState } from "react";

export default function RefCountFixed() {
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");
  return <section>
    <p role="status">已盘点 {count} 次</p>
    <button onClick={() => setCount((n) => n + 1)}>盘点一次</button>
    <label>备注<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </section>;
}
