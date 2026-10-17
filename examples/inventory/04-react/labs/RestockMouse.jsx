import { useContext } from "react";
import { ProductsDispatchContext } from "../src/InventoryContext.jsx";

export default function RestockMouse() {
  const dispatch = useContext(ProductsDispatchContext);
  if (dispatch === null) throw new Error("RestockMouse 需要 InventoryProvider");
  return <button type="button" onClick={() => dispatch({ type: "restocked", id: "P002" })}>给鼠标补 1 件</button>;
}
