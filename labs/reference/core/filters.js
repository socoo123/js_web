// region category-filter
export function createCategoryFilter(category) {
  return (product) => product.category === category;
}
// endregion category-filter

// region counter
export function createCounter() {
  let count = 0;
  return () => ++count;
}
// endregion counter

// region selectors
export function createProductSelectors(products) {
  const selectors = [];
  for (const product of products) {
    selectors.push(() => product.id);
  }
  return selectors;
}
// endregion selectors

// region select-products
export function selectProducts(products, { query = "", category = "全部" } = {}) {
  const keyword = query.trim().toLowerCase();
  return products.filter((product) =>
    (category === "全部" || product.category === category) &&
    (product.id.toLowerCase().includes(keyword) || product.name.toLowerCase().includes(keyword)));
}
// endregion select-products
