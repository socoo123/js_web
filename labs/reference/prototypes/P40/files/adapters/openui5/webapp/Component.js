sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/base/i18n/Localization"], (UIComponent, JSONModel, Localization) => {
  "use strict";
  return UIComponent.extend("course.inventory.Component", {
    metadata: { interfaces: ["sap.ui.core.IAsyncContentCreation"], manifest: "json" },
    init() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({ query: "", message: "", count: 0, stock: 0, valueCents: 0, language: Localization.getLanguage().startsWith("en") ? "en" : "zh-CN" }), "ui");
    },
  });
});
