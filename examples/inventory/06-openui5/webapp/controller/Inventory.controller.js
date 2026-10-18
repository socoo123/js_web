sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/FilterType",
  "course/inventory/model/findProduct", "course/inventory/model/productRules",
  "course/inventory/model/formatter",
], (Controller, JSONModel, Filter, FilterOperator, FilterType, findProduct, rules, formatter) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    formatter,
    onInit() {
      const component = this.getOwnerComponent();
      component.getModel("i18n").getResourceBundle().then((bundle) => {
        if (this.getView().isDestroyed()) return;
        this._bundle = bundle;
        component.getModel("ui").setProperty("/message", bundle.getText("inspectHint"));
      });
    },
    async onInspect() {
      const id = this.byId("productId").getValue().trim();
      const model = this.getView().getModel("inventory");
      const products = model.getProperty("/products");
      const bundle = await this.getOwnerComponent().getModel("i18n").getResourceBundle();
      let message;
      if (!Array.isArray(products)) message = bundle.getText("notReady");
      else if (!id) message = bundle.getText("enterId");
      else {
        const product = findProduct(products, id);
        message = product
          ? bundle.getText("inspected", [product.id, product.name, product.stock])
          : bundle.getText("notFound");
      }
      this.getView().getModel("ui").setProperty("/message", message);
    },
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
      const products = this.byId("products").getItems()
        .map((item) => item.getBindingContext("inventory").getObject());
      const summary = rules.summarize(products);
      const ui = this.getView().getModel("ui");
      Object.entries(summary).forEach(([key, value]) => ui.setProperty(`/${key}`, value));
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
        const field = Object.keys(result.errors).find((key) => result.errors[key]);
        const ids = { name: "editName", category: "editCategory", stock: "editStock", price: "editPrice" };
        this.byId(ids[field]).focus();
        return;
      }
      const inventory = this.getView().getModel("inventory");
      const current = inventory.getProperty(this._editPath);
      inventory.setProperty(this._editPath, { ...current, ...result.value });
      this.getView().getModel("ui").setProperty("/message", this._bundle.getText("saved"));
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
