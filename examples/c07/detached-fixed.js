class StockReport {
  constructor(product) { this.product = product; }
  readStock() { return this.product.stock; }
}
function runReport(callback) {
  return callback();
}
const report = new StockReport({ id: "P001", stock: 12 });
console.log(runReport(() => report.readStock())); // → 12
console.log(runReport(report.readStock.bind(report))); // → 12
