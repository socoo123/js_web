// 有问题的写法：按钮和统计最近的 Provider 不是同一个
import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventorySummary from "../src/InventorySummary.jsx";
import RestockMouse from "./RestockMouse.jsx";

export default function ContextSplitBroken() {
  return (
    <InventoryProvider>
      <RestockMouse />
      <InventoryProvider><InventorySummary /></InventoryProvider>
    </InventoryProvider>
  );
}
