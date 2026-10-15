{
  var productName = "键盘";

  function showStock(stock, onReady) {
    onReady(productName + "剩余库存：" + stock);
  }

  showStock(12, function (message) {
    console.log(message);
  });
}
