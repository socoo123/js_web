// region controller
sap.ui.define([
  "sap/ui/core/mvc/Controller", "course/inventory/model/rules",
], (Controller, rules) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    onSummarize() {
      const products = this.getView().getModel("inventory").getProperty("/products");
      const summary = rules.summarize(products);
      this.getView().getModel("ui").setProperty("/message",
        `${summary.count} 种商品，总库存 ${summary.stock} 件`);
    },
  });
});
// endregion controller
