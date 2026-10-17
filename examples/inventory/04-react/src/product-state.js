export function restockProduct(items, id) {
  return items.map((product) => product.id === id
    ? { ...product, stock: Math.min(product.stock + 1, 99999) }
    : product);
}

export function removeProduct(items, id) {
  return items.filter((product) => product.id !== id);
}

export function nextProductId(items) {
  const number = Math.max(0, ...items.map((product) => Number(product.id.slice(1)))) + 1;
  return number > 999 ? null : `P${String(number).padStart(3, "0")}`;
}

export function addSampleProduct(items) {
  const id = nextProductId(items);
  if (id === null) return items;
  return [...items, { id, name: "新商品", category: "配件", stock: 0, priceCents: 0, tags: [] }];
}

export function selectProducts(items, { query = "", category = "全部", order = "id" } = {}) {
  const keyword = query.trim().toLowerCase();
  const filtered = items.filter((product) =>
    product.name.toLowerCase().includes(keyword) &&
    (category === "全部" || product.category === category));
  return [...filtered].sort((a, b) => {
    if (order === "stock") return a.stock - b.stock || a.id.localeCompare(b.id);
    if (order === "price") return a.priceCents - b.priceCents || a.id.localeCompare(b.id);
    return a.id.localeCompare(b.id);
  });
}
