export function createCategoryFilter(category) {
  return function matchesCategory(product) {
    return product.category === category;
  };
}

export class Inventory {
  #products;
  constructor(products) {
    this.#products = [...products];
  }
  count() { return this.#products.length; }
  select(predicate) {
    const selected = [];
    for (const product of this.#products) {
      if (predicate(product)) selected.push(product);
    }
    return selected;
  }
}
