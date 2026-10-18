sap.ui.define(["sap/ui/core/mvc/XMLView"], (XMLView) => {
  "use strict";
  XMLView.create({ id: "inventory-view", viewName: "course.c39.Inventory" })
    .then((view) => view.placeAt("content"))
    .catch((error) => {
      document.getElementById("content").textContent = "加载失败，请查看 Console 和 Network。";
      console.error(error);
    });
});
