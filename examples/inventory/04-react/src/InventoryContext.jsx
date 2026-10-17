import { createContext, useReducer } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { productsReducer } from "./products-reducer.js";

export const ProductsContext = createContext(null);
export const ProductsDispatchContext = createContext(null);

export function InventoryProvider({ children }) {
  const [products, dispatch] = useReducer(productsReducer, initialProducts, structuredClone);
  return (
    <ProductsContext value={products}>
      <ProductsDispatchContext value={dispatch}>
        {children}
      </ProductsDispatchContext>
    </ProductsContext>
  );
}
