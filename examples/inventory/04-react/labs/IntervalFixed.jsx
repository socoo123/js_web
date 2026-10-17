import { useEffect, useState } from "react";

export default function IntervalFixed() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p role="status">已检查 {count} 次</p>;
}
