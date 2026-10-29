sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/FilterType",
  "course/inventory/model/rules", "course/inventory/model/formatter",
], (Controller, JSONModel, Filter, FilterOperator, FilterType, rules, formatter) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    formatter,
    onInit() {
      this.getOwnerComponent().getModel("i18n").getResourceBundle().then((bundle) => {
        if (!this.getView().isDestroyed()) this._bundle = bundle;
      });
    },
    // region detail-link
    onDetail(event) {
      const id = event.getSource().getBindingContext("inventory").getProperty("id");
      this.getOwnerComponent().getRouter().navTo("detail", { id });
    },
    // endregion detail-link
    onFilter(event) {
      const query = event.getParameter("query").trim();
      const filters = query ? [new Filter({
        filters: [new Filter("name", FilterOperator.Contains, query),
          new Filter("id", FilterOperator.Contains, query)],
        and: false,
      })] : [];
      this.byId("products").getBinding("items").filter(filters, FilterType.Application);
    },
    onUpdateFinished() {
      const all = this.getView().getModel("inventory").getProperty("/products");
      if (!Array.isArray(all)) return;
      const products = this.byId("products").getItems()
        .map((item) => item.getBindingContext("inventory").getObject());
      const ui = this.getView().getModel("ui");
      Object.entries(rules.summarize(products)).forEach(([key, value]) => ui.setProperty(`/${key}`, value));
      ui.setProperty("/allStock", rules.summarize(all).stock);
    },
    async onEdit(event) {
      const context = event.getSource().getBindingContext("inventory");
      this._editPath = context.getPath();
      this.getView().getModel("draft")?.destroy();
      this.getView().setModel(new JSONModel(rules.toDraft(context.getObject())), "draft");
      this._dialogPromise ??= this.loadFragment({ name: "course.inventory.view.EditDialog" });
      const dialog = await this._dialogPromise;
      dialog.open();
    },
    onSave() {
      const draft = this.getView().getModel("draft");
      const result = rules.parseDraft(draft.getData());
      draft.setProperty("/errors", result.errors);
      draft.setProperty("/hasErrors", result.hasErrors);
      if (result.hasErrors) {
        const field = Object.keys(result.errors)[0];
        const ids = { name: "editName", category: "editName", stock: "editStock", price: "editPrice" };
        this.byId(ids[field]).focus();
        return;
      }
      const inventory = this.getView().getModel("inventory");
      const current = inventory.getProperty(this._editPath);
      inventory.setProperty(this._editPath, { ...current, ...result.value });
      this.getView().getModel("ui").setProperty("/message", this._bundle?.getText("saved") ?? "已保存");
      this.byId("editDialog").close();
    },
    onCancel() { this.byId("editDialog").close(); },
    onExit() { this.getView().getModel("draft")?.destroy(); },
    onLanguageChange(event) {
      const url = new URL(window.location.href);
      url.searchParams.set("sap-ui-language", event.getSource().getSelectedKey());
      window.location.assign(url.href);
    },
  });
});
