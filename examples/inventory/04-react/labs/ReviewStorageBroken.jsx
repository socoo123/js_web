// 有问题的写法：在初始化时直接信任浏览器里的 JSON
import { useState } from "react";
import { readInventorySnapshot } from "../src/inventory-storage.js";

export default function ReviewStorageBroken({ storage, storageKey }) {
  const [products] = useState(() => readInventorySnapshot(storage, storageKey));
  return <p>本地库存 {products.reduce((sum, product) => sum + product.stock, 0)} 件</p>;
}
