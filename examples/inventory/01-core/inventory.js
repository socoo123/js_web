export function createCategoryFilter(category) {
  return function matchesCategory(product) {
    return product.category === category;
  };
}
