Promise.resolve({ id: "P002", stock: 0 })
  .then(product => {
    if (product.stock === 0) throw new Error("已售罄");
    return product.stock;
  })
  .then(stock => console.log("可销售", stock))
  .catch(error => {
    console.log("捕获", error.message);
    return 0;
  })
  .then(stock => console.log("恢复值", stock));
