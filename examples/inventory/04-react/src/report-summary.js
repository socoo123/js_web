export function summarizeCategories(products) {
  const groups = new Map();
  for (const product of products) {
    const group = groups.get(product.category) ?? {
      category: product.category, count: 0, stock: 0, valueCents: 0,
    };
    group.count += 1;
    group.stock += product.stock;
    group.valueCents += product.stock * product.priceCents;
    groups.set(product.category, group);
  }
  return [...groups.values()];
}
