sap.ui.define([
  "sap/ui/core/mvc/Controller", "course/inventory/model/findProduct",
], (Controller, findProduct) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    onInspect() {
      const id = this.byId("productId").getValue().trim();
      const model = this.getView().getModel("inventory");
      const products = model.getProperty("/products");
      let message;
      if (!Array.isArray(products)) message = "商品尚未就绪，请稍后重试。";
      else if (!id) message = "请输入商品编号。";
      else {
        const product = findProduct(products, id);
        message = product
          ? `${product.id} ${product.name} · 库存 ${product.stock} 件`
          : "未找到商品。";
      }
      this.getView().getModel("ui").setProperty("/message", message);
    },
  });
});
