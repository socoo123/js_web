async function showStock() {
  console.log("读取前");
  const stock = await Promise.resolve(0);
  console.log("库存", stock);
}

console.log("开始");
showStock();
console.log("结束");
