// region snapshot-init
import React, { createContext, useContext, useReducer, useState } from "react";
import seed from "../../data/products.json" with { type: "json" };
import { inventoryReducer } from "./inventory-reducer.js";
import { readProducts, saveProducts, recoverProducts, decodeSnapshot, encodeSnapshot } from "../services/storage.js";
export const reactStorageKey = "js_web:inventory:react:v2";
export function useInventorySnapshot() {
  const [initial] = useState(() => {
    try { return { products: readProducts(localStorage, reactStorageKey) ?? structuredClone(seed), message: "" }; }
    catch (error) { return { products: structuredClone(seed), message: `读取失败：${error.message}，可恢复备份或导入快照` }; }
  });
  const [message, setMessage] = useState(initial.message);
// endregion snapshot-init
// region snapshot-actions
  function save(products) {
    try { saveProducts(localStorage, products, reactStorageKey); setMessage("本地快照已保存"); }
    catch (error) { setMessage(`保存失败：${error.message}`); }
  }
  function recover() {
    try { const products = recoverProducts(localStorage, reactStorageKey); setMessage("备份已恢复"); return products; }
    catch (error) { setMessage(`恢复失败：${error.message}`); return null; }
  }
  function importText(text) {
    try {
      const products = decodeSnapshot(text);
      saveProducts(localStorage, products, reactStorageKey);
      setMessage("导入完成"); return products;
    } catch (error) { setMessage(`导入失败：${error.message}`); return null; }
  }
  return { initial: initial.products, message, save, recover, importText, report: setMessage };
}
// endregion snapshot-actions
// region provider
const InventoryContext = createContext(null);
export function InventoryProvider({ children }) {
  const snapshot = useInventorySnapshot();
  const [products, dispatch] = useReducer(inventoryReducer, snapshot.initial);
  const replace = (next) => { if (next !== null) dispatch({ type: "replaced", products: next }); };
  const controls = {
    message: snapshot.message, report: snapshot.report, save: () => snapshot.save(products),
    recover: () => replace(snapshot.recover()),
    importText: (text) => replace(snapshot.importText(text)),
    exportText: () => encodeSnapshot(products),
  };
  return <InventoryContext value={{ products, dispatch, snapshot: controls }}>{children}</InventoryContext>;
}
export function useInventory() {
  const value = useContext(InventoryContext);
  if (value === null) throw new Error("需要 InventoryProvider");
  return value;
}
// endregion provider
