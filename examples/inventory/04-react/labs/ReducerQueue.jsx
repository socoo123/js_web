import { useReducer } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { productsReducer } from "../src/products-reducer.js";

export default function ReducerQueue() {
  const [products, dispatch] = useReducer(productsReducer, initialProducts, structuredClone);
  const stock = products.find((product) => product.id === "P002").stock;
  function handleClick() {
    console.log("点击时", stock);
    const result = dispatch({ type: "restocked", id: "P002" });
    dispatch({ type: "restocked", id: "P002" });
    console.log("派发后", stock, result);
  }
  return <button type="button" onClick={handleClick}>鼠标库存 {stock} 件，连续补两次</button>;
}
