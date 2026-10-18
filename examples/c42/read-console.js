sap.ui.require(["sap/ui/core/Element"], (Element) => {
  const model = Element.getElementById("odataView").getModel("odata");
  model.read("/Products('P002')", {
    success: (product) => console.log(product.id, product.stock), // → P002 0
    error: (error) => console.log("读取失败", error.statusCode),
  });
});
