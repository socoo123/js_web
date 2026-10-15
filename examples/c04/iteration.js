const values = [12, 0, 7]; // P001–P003 的库存
for (const quantity of values) {
  console.log("of", quantity, typeof quantity);
}
// → of 12 number / of 0 number / of 7 number
for (const key in values) {
  console.log("in", key, typeof key);
}
// → in 0 string / in 1 string / in 2 string
