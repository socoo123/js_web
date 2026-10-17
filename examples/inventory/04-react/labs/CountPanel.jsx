import { useState } from "react";

export default function CountPanel({ visible }) {
  const [count, setCount] = useState(0);
  if (!visible) return null;
  return <button type="button" onClick={() => setCount((n) => n + 1)}>核对 {count} 次</button>;
}
