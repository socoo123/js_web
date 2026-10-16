const stock = new Promise((resolve, reject) => {
  resolve(0);
  reject(new Error("太晚了"));
  resolve(12);
  console.log("执行器继续");
});
stock.then(value => console.log("库存", value));
