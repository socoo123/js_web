sap.ui.require(["sap/ui/model/json/JSONModel"], (JSONModel) => {
  const model = new JSONModel({ product: { stock: 0 } });
  console.log(model.getDefaultBindingMode()); // → TwoWay
  model.setProperty("/product/stock", 3);
  console.log(model.getProperty("/product/stock")); // → 3
  console.log(model.getProperty("/product/Stock")); // → undefined
  model.destroy();
});
