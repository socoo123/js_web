import { useState } from "react";
import { initializeInventory, readInventorySnapshot } from "../src/inventory-storage.js";

export default function ReviewStorageFixed({ storage, storageKey }) {
  const [record] = useState(() => initializeInventory(() => readInventorySnapshot(storage, storageKey)));
  return <><p>本地库存 {record.products.reduce((sum, product) => sum + product.stock, 0)} 件</p>
    <p role="status">{record.message}</p></>;
}
