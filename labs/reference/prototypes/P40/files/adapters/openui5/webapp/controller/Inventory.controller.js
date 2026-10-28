sap.ui.define(["sap/ui/core/mvc/Controller", "course/inventory/model/rules"], (Controller, rules) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    onInit() { this.rules = rules; },
  });
});
