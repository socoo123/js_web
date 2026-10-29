// region header
sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], (Controller, JSONModel) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Detail", {
    onInit() {
      this._sequence = 0;
      this.getView().setModel(new JSONModel({ status: "loading" }), "detail");
      const router = this.getOwnerComponent().getRouter();
      this._routes = [router.getRoute("detail"), router.getRoute("missing")];
      this._routes.forEach((route) => route.attachPatternMatched(this.onMatched, this));
    },
// endregion header
    // region matched
    async onMatched(event) {
      const sequence = ++this._sequence;
      const id = event.getParameter("arguments").id;
      const view = this.getView();
      const detail = view.getModel("detail");
      view.unbindElement("inventory");
      detail.setProperty("/status", id ? "loading" : "routeMissing");
      if (!id) return;
      try {
        await this.getOwnerComponent().inventoryReady;
        if (view.isDestroyed() || sequence !== this._sequence) return;
        const products = view.getModel("inventory").getProperty("/products");
        const index = products.findIndex((product) => product.id === id);
        detail.setProperty("/status", index < 0 ? "missing" : "found");
        if (index >= 0) view.bindElement({ path: `/products/${index}`, model: "inventory" });
      } catch {
        if (!view.isDestroyed() && sequence === this._sequence) detail.setProperty("/status", "error");
      }
    },
    // endregion matched
    // region tail
    onList() { this.getOwnerComponent().getRouter().navTo("list", {}, true); },
    onExit() {
      this._sequence++;
      this._routes.forEach((route) => route.detachPatternMatched(this.onMatched, this));
      this.getView().getModel("detail").destroy();
    },
  });
});
// endregion tail
