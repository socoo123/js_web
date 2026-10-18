sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel",
  "course/inventory/model/formatter",
], (Controller, JSONModel, formatter) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Detail", {
    formatter,
    onInit() {
      this._sequence = 0;
      this.getView().setModel(new JSONModel({ status: "loading" }), "detail");
      this._route = this.getOwnerComponent().getRouter().getRoute("detail");
      this._route.attachPatternMatched(this.onMatched, this);
    },
    async onMatched(event) {
      const sequence = ++this._sequence;
      const id = event.getParameter("arguments").id;
      const view = this.getView();
      view.unbindElement("inventory");
      view.getModel("detail").setProperty("/status", "loading");
      try {
        await this.getOwnerComponent().inventoryReady;
        if (view.isDestroyed() || sequence !== this._sequence) return;
        const products = view.getModel("inventory").getProperty("/products");
        const index = products.findIndex((product) => product.id === id);
        view.getModel("detail").setProperty("/status", index < 0 ? "missing" : "found");
        if (index >= 0) view.bindElement({ path: `/products/${index}`, model: "inventory" });
      } catch {
        if (!view.isDestroyed() && sequence === this._sequence) {
          view.getModel("detail").setProperty("/status", "error");
        }
      }
    },
    onList() { this.getOwnerComponent().getRouter().navTo("list", {}, true); },
    onExit() {
      this._sequence++;
      this._route.detachPatternMatched(this.onMatched, this);
      this.getView().getModel("detail").destroy();
    },
  });
});
