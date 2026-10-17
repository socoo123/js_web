const { totalStock } = require("./legacy-total.cjs");
module.exports = products => "库存 " + totalStock(products) + " 件";
