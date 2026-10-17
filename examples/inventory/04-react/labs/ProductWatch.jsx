import { useEffect, useState } from "react";

export default function ProductWatch({ productId }) {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    function handlePulse() {
      console.log("收到", productId);
      setHits((n) => n + 1);
    }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
    return () => {
      console.log("cleanup", productId);
      window.removeEventListener("inventory-pulse", handlePulse);
    };
  }, [productId]);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
