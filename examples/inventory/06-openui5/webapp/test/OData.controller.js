sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
], (Controller, Filter, FilterOperator, Sorter) => {
  "use strict";
  return Controller.extend("course.inventory.test.OData", {
    onRead() {
      this.getView().getModel("probe").setProperty("/result", "读取中……");
      this.getView().getModel("odata").read("/Products", {
        filters: [new Filter({
          filters: [new Filter("stock", FilterOperator.GE, 1), new Filter("stock", FilterOperator.LE, 5)],
          and: true,
        })],
        sorters: [new Sorter("stock", true), new Sorter("id")],
        urlParameters: { "$top": "2", "$select": "id,name,stock,priceCents" },
        success: (data) => this.getView().getModel("probe").setProperty("/result",
          data.results.map((product) => `${product.id} ${product.name} ${product.stock}`).join("；")),
        error: (error) => this.getView().getModel("probe").setProperty("/result", "读取失败，请检查集合名和模拟服务。"),
      });
    },
  });
});
