async function count() {
  console.log("计数开始");
  await 0;
  console.log("计数结束");
  return 6;
}

const result = count();
result.then(value => console.log("商品数", value));
console.log("页面继续");
