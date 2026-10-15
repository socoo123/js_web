let stock = 12; // P001 机械键盘，售出 3 件
const sold = 3;
stock = stock - sold;
console.log(stock); // → 9

const product = { id: "P001", stock: 12 };
product.stock = product.stock - sold;
console.log(product.stock); // → 9
try {
  product = { id: "P002", stock: 0 };
} catch (error) {
  console.log(error.name); // → TypeError
}
