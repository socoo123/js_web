class StockLabel {
  constructor(product) { this.product = product; }
  label() { return `${this.product.name}：${this.product.stock} 件`; }
}
class LowStockLabel extends StockLabel {
  label() { return `${super.label()}（需补货）`; }
}
const dock = new LowStockLabel({ id: "P004", name: "USB-C 扩展坞", stock: 3 });
console.log(dock.label()); // → USB-C 扩展坞：3 件（需补货）
console.log(Object.getPrototypeOf(LowStockLabel.prototype) === StockLabel.prototype); // → true
