import { useContext } from "react";
import { InventoryPersistenceContext } from "./InventoryContext.jsx";

export default function InventoryPersistence() {
  const { message, saveSnapshot, clearSnapshot } = useContext(InventoryPersistenceContext);
  return <section aria-label="本地库存快照">
    <p>保存当前商品供刷新后恢复。编辑草稿、筛选、盘点次数和模拟远端副本另行管理。</p>
    <button type="button" onClick={saveSnapshot}>保存本地快照</button>{" "}
    <button type="button" onClick={clearSnapshot}>清除本地快照</button>
    <p role="status">{message}</p>
  </section>;
}
