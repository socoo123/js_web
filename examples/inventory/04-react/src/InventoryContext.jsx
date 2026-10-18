import { createContext, useReducer, useState } from "react";
import { productsReducer } from "./products-reducer.js";
import { initializeInventory, INVENTORY_STORAGE_KEY, writeInventorySnapshot } from "./inventory-storage.js";

export const ProductsContext = createContext(null);
export const ProductsDispatchContext = createContext(null);
export const InventoryPersistenceContext = createContext(null);

export function InventoryProvider({ children }) {
  const [initial] = useState(() => initializeInventory());
  const [products, dispatch] = useReducer(productsReducer, initial.products);
  const [message, setMessage] = useState(initial.message);
  function saveSnapshot() {
    try {
      writeInventorySnapshot(globalThis.localStorage, products);
      setMessage("本地快照已保存；此后修改需再次保存，刷新将恢复这份快照。");
    } catch { setMessage("本地快照保存失败，当前商品仍可操作；旧快照可能仍在。"); }
  }
  function clearSnapshot() {
    try {
      globalThis.localStorage.removeItem(INVENTORY_STORAGE_KEY);
      setMessage("本地快照已清除，当前商品保留；刷新后恢复初始商品。");
    } catch { setMessage("本地快照清除失败；当前商品保留，请检查浏览器存储权限。"); }
  }
  return (
    <ProductsContext value={products}>
      <ProductsDispatchContext value={dispatch}>
        <InventoryPersistenceContext value={{ message, saveSnapshot, clearSnapshot }}>
          {children}
        </InventoryPersistenceContext>
      </ProductsDispatchContext>
    </ProductsContext>
  );
}
