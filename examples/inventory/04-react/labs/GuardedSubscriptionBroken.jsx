// 有问题的写法：第一次清理后，ref 阻止重新建立监听
import { useEffect, useRef, useState } from "react";

export default function GuardedSubscriptionBroken({ productId }) {
  const startedRef = useRef(false);
  const [hits, setHits] = useState(0);
  useEffect(() => {
    // 有问题的写法：拦住重新 setup，掩盖清理是否正确
    if (startedRef.current) return;
    startedRef.current = true;
    function handlePulse() { setHits((n) => n + 1); }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
    return () => {
      console.log("cleanup", productId);
      window.removeEventListener("inventory-pulse", handlePulse);
    };
  }, [productId]);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
