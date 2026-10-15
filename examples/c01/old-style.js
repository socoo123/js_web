var legacyProductName = "机械键盘";

function showStock(stock, onReady) {
  onReady(legacyProductName + "剩余库存：" + stock);
}

showStock(12, function (message) {
  console.log(message);
});
