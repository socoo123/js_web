import { useEffect } from "react";
export function useInventoryShortcuts(count, onRestock) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `库存工作台 · ${count} 件商品`;
    return () => { document.title = previousTitle; };
  }, [count]);
  useEffect(() => {
    function onKey(event) {
      if (event.altKey && event.key === "ArrowUp" && !event.repeat && !event.defaultPrevented && !event.isComposing) {
        event.preventDefault(); onRestock("P001", 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRestock]);
}
