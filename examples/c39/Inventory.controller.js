sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel",
], (Controller, JSONModel) => {
  "use strict";
  return Controller.extend("course.c39.Inventory", {
    onInit() {
      const model = new JSONModel({
        product: { id: "P002", name: "无线鼠标", category: "外设", stock: 0, priceCents: 12900, tags: [] },
      });
      this.getView().setModel(model, "inventory");
    },
    onRestock() {
      const model = this.getView().getModel("inventory");
      const stock = model.getProperty("/product/stock");
      if (new URLSearchParams(location.search).get("case") === "broken") {
        // 有问题的写法：绕过模型 API，没有通知绑定。
        model.getData().product.stock = stock + 3;
      } else {
        model.setProperty("/product/stock", stock + 3);
      }
      console.log("模型库存", model.getProperty("/product/stock"));
    },
    onExit() {
      this.getView().getModel("inventory").destroy();
    },
  });
});
