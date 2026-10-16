function parseStock(text) {
  if (text.trim() === "") return null;
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return null;
  return stock;
}
console.log(parseStock("0"));     // → 0
console.log(parseStock(" 3 "));   // → 3
console.log(parseStock(""));      // → null
console.log(parseStock("3.8"));   // → null
console.log(parseStock("3件"));   // → null
console.log(parseStock("100000")); // → null
