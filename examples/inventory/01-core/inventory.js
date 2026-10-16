export function createCategoryFilter(category) {
  return function matchesCategory(product) {
    return product.category === category;
  };
}

export class Inventory {
  #products;
  #byId;
  #history = [];
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
  setStock(id, stock) {
    const product = this.getById(id);
    if (product === undefined) throw new Error("商品不存在：" + id);
    if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
      throw new RangeError("库存须为 0–99999 的整数");
    }
    if (product.stock === stock) return false;
    this.#history.push({ id, stock: product.stock });
    product.stock = stock;
    return true;
  }
  undo() {
    const previous = this.#history.pop();
    if (previous === undefined) return false;
    this.getById(previous.id).stock = previous.stock;
    return true;
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

export function loadInventory(source, { fail = false, delayMs = 20 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error("库存加载失败"));
        return;
      }
      try {
        const snapshot = source.map(product => ({ ...product, tags: [...product.tags] }));
        resolve(new Inventory(snapshot));
      } catch (error) {
        reject(error);
      }
    }, delayMs);
  });
}
