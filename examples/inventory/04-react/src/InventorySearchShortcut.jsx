import { useEffect } from "react";

export default function InventorySearchShortcut({ inputRef }) {
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey
        || event.defaultPrevented || event.isComposing) return;
      if (target instanceof HTMLElement
        && (target.closest("input, textarea, select") || target.isContentEditable)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);
  return null;
}
