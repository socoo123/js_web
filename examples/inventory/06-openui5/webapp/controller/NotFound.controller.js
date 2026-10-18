sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";
  return Controller.extend("course.inventory.controller.NotFound", {
    onList() { this.getOwnerComponent().getRouter().navTo("list", {}, true); },
  });
});
