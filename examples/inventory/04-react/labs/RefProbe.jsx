import { useRef, useState } from "react";

export default function RefProbe() {
  const visitsRef = useRef(0);
  const [revision, setRevision] = useState(0);
  let visits = 0;
  function handleRead() {
    visits += 1;
    visitsRef.current += 1;
    console.log("局部 / ref / state", visits, visitsRef.current, revision);
  }
  return <section aria-label="ref 观察">
    <p>界面版本 {revision}</p>
    <button onClick={handleRead}>只记录日志</button>
    <button onClick={() => setRevision((n) => n + 1)}>更新界面版本</button>
  </section>;
}
