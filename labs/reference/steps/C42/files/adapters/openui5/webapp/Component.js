sap.ui.define([
  "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/base/i18n/Localization",
], (UIComponent, JSONModel, Localization) => {
  "use strict";
  return UIComponent.extend("course.inventory.Component", {
    metadata: { interfaces: ["sap.ui.core.IAsyncContentCreation"], manifest: "json" },
    init() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({
        message: "", language: Localization.getLanguage().startsWith("en") ? "en" : "zh-CN",
      }), "ui");
      // region ready
      const inventory = this.getModel("inventory");
      this.inventoryReady = inventory.dataLoaded().then(() => {
        if (!Array.isArray(inventory.getProperty("/products"))) throw new Error("Products unavailable");
      });
      this.inventoryReady.catch(() => {});
      this.getRouter().initialize();
      // endregion ready
    },
  });
});
