const target = new EventTarget();
target.addEventListener("inventory-restock", (event) => {
  console.log(event.type, event.detail.id, event.detail.amount);
});
target.addEventListener("inventoryRestock", () => console.log("另一个名字"));
target.dispatchEvent(new CustomEvent("inventory-restock", {
  detail: { id: "P002", amount: 3 },
}));
