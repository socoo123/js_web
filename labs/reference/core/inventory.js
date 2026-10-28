export * from "./validation.js";
export * from "./stock.js";
export * from "./summary.js";
export * from "./filters.js";
export * from "./collections.js";
export * from "./history.js";
export * from "./tree.js";

export function describeProduct(product) { return `${product.id} ${product.name} · 库存 ${product.stock} 件`; }
