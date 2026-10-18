sap.ui.define([], () => {
  "use strict";
  return function findProduct(products, id) {
    return products.find((product) => product.id === id);
  };
});
