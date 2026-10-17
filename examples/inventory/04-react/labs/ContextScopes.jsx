import { useContext } from "react";
import { ProductsContext } from "../src/InventoryContext.jsx";
import ContextJoined from "./ContextJoined.jsx";

export function MissingProvider() {
  const products = useContext(ProductsContext);
  return <p role="status">{products === null ? "尚未连接库存" : `已连接 ${products.length} 种商品`}</p>;
}

export default function ContextScopes() {
  return <><section aria-label="库存 A"><h2>库存 A</h2><ContextJoined /></section>
    <section aria-label="库存 B"><h2>库存 B</h2><ContextJoined /></section></>;
}
