import { Link, Outlet } from "react-router";
import InventoryTitle from "./InventoryTitle.jsx";

export default function InventoryLayout() {
  return <>
    <InventoryTitle />
    <nav aria-label="库存导航"><Link to="/products">全部商品</Link></nav>
    <Outlet />
  </>;
}
