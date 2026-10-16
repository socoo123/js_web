export function createCategoryFilter(category) {
  return function matchesCategory(product) {
    return product.category === category;
  };
}

export class Inventory {
  #products;
  #byId;
  constructor(products) {
    this.#products = [...products];
    this.#byId = new Map();
    for (const product of this.#products) {
      if (this.#byId.has(product.id)) throw new Error("重复商品 id：" + product.id);
      this.#byId.set(product.id, product);
    }
  }
  getById(id) {
    return this.#byId.get(id);
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
  groupedByCategory() {
    const groups = new Map();
    for (const product of this.#products) {
      if (!groups.has(product.category)) groups.set(product.category, []);
      groups.get(product.category).push(product);
    }
    return groups;
  }
  uniqueTags() {
    const tags = new Set();
    for (const product of this.#products) {
      for (const tag of product.tags) tags.add(tag);
    }
    return [...tags];
  }
}
