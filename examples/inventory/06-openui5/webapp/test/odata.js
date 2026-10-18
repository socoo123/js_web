sap.ui.define([
  "course/inventory/localService/mockserver", "sap/ui/model/odata/v2/ODataModel",
  "sap/ui/model/json/JSONModel", "sap/ui/core/mvc/XMLView",
], (mockserver, ODataModel, JSONModel, XMLView) => {
  "use strict";
  const { server, serviceUrl } = mockserver.start();
  const model = new ODataModel({
    serviceUrl, useBatch: false, tokenHandling: false, defaultBindingMode: "OneWay",
  });
  const probe = new JSONModel({ result: "点击有限查询，读取库存 1–5 件的两件商品。" });
  model.attachMetadataFailed(() => probe.setProperty("/result", "元数据加载失败，请检查服务路径。"));
  XMLView.create({ id: "odataView", viewName: "course.inventory.test.OData" }).then((view) => {
    view.setModel(model, "odata");
    view.setModel(probe, "probe");
    view.placeAt("content");
  });
  window.addEventListener("pagehide", () => { server.stop(); server.destroy(); }, { once: true });
});
