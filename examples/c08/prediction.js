const stocks = [12, 0, 7];
const selected = stocks.filter(stock => stock > 0);
const labels = selected.map((stock, index) => `${index}:${stock}`);
console.log(labels.join(", "));
console.log(selected.sort().join(", "));
console.log(stocks.join(", "));
console.log([].every(stock => stock > 0));
