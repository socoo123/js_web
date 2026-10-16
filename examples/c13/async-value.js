async function getStock() {
  return 0;
}
async function fail() {
  throw new Error("库存加载失败");
}

const result = getStock();
console.log(result instanceof Promise);
result.then(stock => console.log("库存", stock));
fail().catch(error => console.log("错误", error.message));
console.log("继续执行");
