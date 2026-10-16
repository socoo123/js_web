const stocks = new Map([["P001", 12], ["P002", 0]]);
stocks.set("P001", 15);
console.log(stocks.size, stocks.get("P001")); // → 2 15
console.log(stocks.has("P002"), stocks.get("P002")); // → true 0
console.log(stocks.has("P999"), stocks.get("P999")); // → false undefined
console.log([...stocks.keys()].join(", ")); // → P001, P002
console.log(stocks.delete("P001")); // → true
stocks.set("P001", 15);
console.log([...stocks.keys()].join(", ")); // → P002, P001
stocks.clear();
console.log(stocks.size); // → 0
