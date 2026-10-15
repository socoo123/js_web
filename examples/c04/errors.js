function requireStock(quantity) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  return quantity;
}
function readStock() {
  return requireStock(-1);
}

try {
  console.log("库存", readStock());
} catch (error) {
  console.log(error.name, error.message);
  // → RangeError 库存必须是 0–99999 的整数
} finally {
  console.log("本次检查结束"); // → 本次检查结束
}
