import { useReducer } from "react";
import { products as initialProducts } from "../../../shared/products.js";

export default function ReducerProbe({ reducer }) {
  const [products, dispatch] = useReducer(reducer, initialProducts, structuredClone);
  const mouse = products.find((product) => product.id === "P002");
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  return (
    <>
      <p role="status">鼠标库存 {mouse.stock} 件 · 总库存 {totalStock} 件</p>
      <button type="button" onClick={() => dispatch({ type: "restocked", id: "P002" })}>给鼠标补 1 件</button>
    </>
  );
}
