import { useEffect } from "react";
import { attachStockProbe } from "./stock-probe.js";

export default function MemoryProbe({ leaky }) {
  useEffect(() => attachStockProbe(window, document, { leaky }), [leaky]);
  return <p>探针开启；关闭时检查 DOM 与监听器是否一起释放。</p>;
}
