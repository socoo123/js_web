function createCategoryFilter(category) {
  return function matchesCategory(product) {
    return product.category === category;
  };
}
const isPeripheral = createCategoryFilter("外设");
const isAccessory = createCategoryFilter("配件");
const keyboard = { id: "P001", category: "外设", stock: 12 };
console.log(typeof isPeripheral);       // → function
console.log(isPeripheral(keyboard));    // → true
console.log(isAccessory(keyboard));     // → false
console.log(isPeripheral({ id: "P002", category: "外设", stock: 0 })); // → true
