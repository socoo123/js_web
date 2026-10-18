sap.ui.require(["sap/ui/core/Element"], (Element) => {
  const model = Element.getElementById("odataView").getModel("odata");
  console.log(model.getProperty("/Products('P002')/stock")); // → 0
  console.log(typeof model.getProperty("/Products('P999')/stock")); // → undefined
});
