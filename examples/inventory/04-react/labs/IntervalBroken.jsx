// 有问题的写法：回调一直读取初次渲染的 count
import { useEffect, useState } from "react";

export default function IntervalBroken() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p role="status">已检查 {count} 次</p>;
}
