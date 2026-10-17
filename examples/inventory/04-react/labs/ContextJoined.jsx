import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventorySummary from "../src/InventorySummary.jsx";
import RestockMouse from "./RestockMouse.jsx";

export default function ContextJoined() {
  return (
    <InventoryProvider>
      <RestockMouse />
      <InventorySummary />
    </InventoryProvider>
  );
}
