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
    return this.#products.filter(predicate);
  }
  sorted(compareFn) {
    return this.#products.toSorted(compareFn);
  }
  summary() {
    return this.#products.reduce((result, product) => {
      result.totalStock += product.stock;
      result.totalValueCents += product.stock * product.priceCents;
      result.soldOutCount += Number(product.stock === 0);
      result.lowStockCount += Number(product.stock > 0 && product.stock <= 5);
      return result;
    }, { totalStock: 0, totalValueCents: 0, soldOutCount: 0, lowStockCount: 0 });
  }
}
