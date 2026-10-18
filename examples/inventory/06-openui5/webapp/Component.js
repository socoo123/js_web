sap.ui.define([
  "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel",
], (UIComponent, JSONModel) => {
  "use strict";
  return UIComponent.extend("course.inventory.Component", {
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json",
    },
    init() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({ message: "输入编号后查看商品。" }), "ui");
    },
  });
});
