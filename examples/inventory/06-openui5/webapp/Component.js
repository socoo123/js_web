sap.ui.define([
  "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/base/i18n/Localization",
], (UIComponent, JSONModel, Localization) => {
  "use strict";
  return UIComponent.extend("course.inventory.Component", {
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json",
    },
    init() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({
        message: "", query: "", count: 0, stock: 0, valueCents: 0,
        language: Localization.getLanguage().startsWith("en") ? "en" : "zh-CN",
      }), "ui");
      const inventory = this.getModel("inventory");
      this.inventoryReady = inventory.dataLoaded().then(() => {
        if (!Array.isArray(inventory.getProperty("/products"))) throw new Error("Products unavailable");
      });
      // 保留拒绝状态供详情页处理，同时避免停留列表时出现未处理的拒绝。
      this.inventoryReady.catch(() => {});
      this.getRouter().initialize();
    },
  });
});
