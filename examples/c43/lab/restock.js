export function parseAmount(text) {
  if (text.trim() === "") return null;
  const amount = Number(text);
  return Number.isInteger(amount) && amount >= 1 && amount <= 99999
    ? amount : null;
}

export function restock(product, text) {
  const amount = parseAmount(text);
  if (amount === null || product.stock + amount > 99999) return null;
  return { ...product, stock: product.stock + amount };
}
