function validateStock(stock) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new Error("库存应为 0–99999 的整数");
  }
  return stock;
}
for (const value of [0, "0", -1, 3.8, 99999, 100000]) {
  try {
    console.log(JSON.stringify(value), "通过", validateStock(value));
  } catch (error) {
    console.log(JSON.stringify(value), error.message);
  }
}
