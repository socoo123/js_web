// 有问题的写法：建立监听却没有返回清理函数
import { useEffect, useState } from "react";

export default function SubscriptionBroken({ productId }) {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    function handlePulse() {
      console.log("收到", productId);
      setHits((n) => n + 1);
    }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
  }, [productId]);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
