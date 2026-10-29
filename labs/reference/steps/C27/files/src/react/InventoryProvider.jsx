import React, { createContext, useContext, useReducer } from "react";
import seed from "../../data/products.json" with { type: "json" };
import { inventoryReducer } from "./inventory-reducer.js";
const InventoryContext = createContext(null);
export function InventoryProvider({ children }) {
  const [products, dispatch] = useReducer(inventoryReducer, seed, structuredClone);
  return <InventoryContext value={{ products, dispatch }}>{children}</InventoryContext>;
}
export function useInventory() {
  const value = useContext(InventoryContext);
  if (value === null) throw new Error("需要 InventoryProvider");
  return value;
}
