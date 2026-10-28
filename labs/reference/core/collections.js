import { validateProducts, createDraft } from "./validation.js";
// region inventory-class
export class Inventory {
  constructor(products) {
    validateProducts(products);
    this.products = products.map(createDraft);
  }
  getById(id) {
    return this.products.find((product) => product.id === id) ?? null;
  }
  toProducts() {
    return this.products.map(createDraft);
  }
}
// endregion inventory-class

// region bound-query
export function queryWithCallback(inventory, id) {
  const lookup = inventory.getById.bind(inventory);
  return lookup(id);
}
// endregion bound-query

// region sort-stock
export function sortByStock(products) {
  return [...products].sort((left, right) => left.stock - right.stock);
}
// endregion sort-stock

// region id-index
export function indexProducts(products) {
  const byId = new Map();
  for (const product of products) {
    if (byId.has(product.id)) throw new TypeError(`重复编号 ${product.id}`);
    byId.set(product.id, product);
  }
  return byId;
}
// endregion id-index

// region groups-tags
export function groupByCategory(products) {
  const groups = new Map();
  for (const product of products) {
    const items = groups.get(product.category) ?? [];
    items.push(product);
    groups.set(product.category, items);
  }
  return groups;
}
export function uniqueTags(products) {
  return [...new Set(products.flatMap((product) => product.tags))];
}
// endregion groups-tags
