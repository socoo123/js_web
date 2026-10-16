// 有问题的写法：传出方法时，没有保留接收对象
class StockReport {
  constructor(product) { this.product = product; }
  readStock() { return this.product.stock; }
}
function runReport(callback) {
  return callback();
}
const report = new StockReport({ id: "P001", stock: 12 });
try {
  console.log(runReport(report.readStock));
} catch (error) {
  console.log(error.name); // → TypeError
}
