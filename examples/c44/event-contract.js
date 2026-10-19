const list = new EventTarget();
const item = { dataset: { productId: "P002" } };
list.addEventListener("item-click", (event) => {
  console.log(event.target === list);
  console.log(event.detail.item.dataset.productId);
});
list.dispatchEvent(new CustomEvent("item-click", { detail: { item } }));
