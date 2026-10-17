export default function InventoryToolbar({ count, children }) {
  return (
    <header className="inventory-toolbar">
      <p>共 {count} 种商品</p>
      <div>{children}</div>
    </header>
  );
}
