class ProductStock {
  #stock;
  constructor(id, stock) {
    this.id = id;
    this.#stock = stock;
  }
  readStock() { return this.#stock; }
  restock(amount) {
    if (!Number.isInteger(amount) || amount < 1 || this.#stock + amount > 99999) {
      throw new RangeError("补货数量无效");
    }
    this.#stock += amount;
  }
}
const keyboard = new ProductStock("P001", 12);
const mouse = new ProductStock("P002", 0);
keyboard.restock(3);
console.log(keyboard.readStock(), mouse.readStock()); // → 15 0
console.log(keyboard.stock);                         // → undefined
console.log(Object.hasOwn(keyboard, "#stock"));       // → false
console.log(Object.getPrototypeOf(keyboard) === ProductStock.prototype); // → true
console.log(keyboard.readStock === mouse.readStock);  // → true
